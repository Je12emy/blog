---
title: "Building a CLI application with Clap"
description: "This is a very brief guide on how you can build a CLI application using Rust's clap crate"
pubDate: "Jul 31 2023"
---

# Building a CLI app with Clap

Parsing CLI arguments with plain Rust may be a bit non intuitive.

```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() <= 1 {
        println!("Not args where passed")
    }

    let name = &args[1];

    println!("{}", name);
}
```

With the [clap crate](https://docs.rs/) you are able to parse CLI arguments. To get started in a project you must add clap as a dependency.

```toml
clap = { version = "4.3.19", features = ["derive"] }
```


> [!Warning]- Derive is a feature flag
> Some traits like `Parser` are hidden under the `derive`  feature flag. So if you don't enable it, you will run into errors.

You are now able to define a struct for describing how your CLI works. In this demo CLI app, I will enable the user to create users. Notice how comments are made with 3 slashes `///` this is used by clap to generate help documentation.

```rust
use clap::Parser;

#[derive(Debug, Parser)]
#[clap(author, version, about)]
struct CliArgs {
    /// The username
    username: String,
    /// The email
    email: String,
}

fn main() {
    let args = CliArgs::parse();
}
```


> [!Warning]- Make sure `Parser` is in scope when calling `parse`
> If you where to move the structs into a separate module, you will still need to import the `Parser` trait in your `main` function.


When running this application we now get the following documentation.
```
clap-test --help
Usage: clap-test <USERNAME> <EMAIL>

Arguments:
  <USERNAME>  The username
  <EMAIL>     The email

Options:
  -h, --help     Print help
  -V, --version  Print version
```

# Sub commands

You can define sub commands through `enum` values, let's expand our example.

```rust
use clap::{Args, Parser, Subcommand};

#[derive(Debug, Parser)]
#[clap(author, version, about)]
struct Cli {
    #[clap(subcommand)]
    resource: Resource,
}

#[derive(Debug, Subcommand)]
enum Resource {
    #[clap(subcommand)]
    /// Create, Read, Update or Delete a User entity
    User(UserCommand),
}

#[derive(Debug, Subcommand)]
enum UserCommand {
    /// Create a user
    Create(CreateUserCommand),
}

#[derive(Debug, Args)]
struct CreateUserCommand {
    /// The username
    username: String,
    /// The email
    email: String,
}

fn main() {
    let args = Cli::parse();
}
```

This is what shows up when we run our CLI.

```
clap-test user create
error: the following required arguments were not provided:
  <USERNAME>
  <EMAIL>

Usage: clap-test user create <USERNAME> <EMAIL>

For more information, try '--help'.
```

Notice how we are using the same 3 traits to describe how our CLI works: `Parser`, `Subccommand` and `Args`.

- If a value represents a type and number or arguments that after that, you would use an `enum` with the `subcommand` trait.
- An `enum` then references a struct which specifies the expected fields with the `args` trait, for that sub command.

For convenience, we can also provide a short and long flag for our arguments. Clap can automatically generate a short alias for us.

```rust
#[derive(Debug, Args)]
struct CreateUserCommand {
    /// The username
    #[arg(short, long)]
    username: String,
    /// The email
    #[arg(short, long)]
    email: String,
}
```

Notice show the argument `username` can be set using the `-u`  flag and `-e` for the email.

```
clap-test user create -h
Create a user

Usage: clap-test user create [OPTIONS] --username <USERNAME> --email <EMAIL>

Options:
  -u, --username <USERNAME>          The username
  -e, --email <EMAIL>                The email
  -h, --help                         Print help
```

# Global Flags

Suppose you would like to enabled an **optional** global flag which will affect all sub-comands, this is posible with the `global` argument. 

```rust
#[derive(Debug, Parser)]
#[clap(author, version, about)]
struct Cli {
    #[clap(subcommand)]
    resource: Resource,
    #[arg(global = true, short, long)]
    /// Enable verbose logging
    verbose: bool,
}
```

You are now able to use the `-v` flag anywhere.

```
$ clap-test on  main  clap-test -h
Usage: clap-test [OPTIONS] <COMMAND>

Commands:
  user  Create, Read, Update or Delete a User entity
  help  Print this message or the help of the given subcommand(s)

Options:
  -v, --verbose
  -h, --help     Print help
  -V, --version  Print version
```

[I did run into some issues](https://stackoverflow.com/questions/76792199/global-cli-argument-is-being-required-twice?noredirect=1#comment135380495_76792199) when I wanted to use these global arguments for more complex operations, say for example, passing an access token or an API key in case you CLI is supposed to interact with some external API. To fix this I propose you still provide an invalid default value and perform a validation after parsing.

```rust
use clap::{Args, Parser, Subcommand};

pub const INVALID_TOKEN_DEFAULT_VALUE: &str = "INVALID";


[derive(Debug, Parser)]
#[clap(author, version, about)]
struct Cli {
    #[clap(subcommand)]
    resource: Resource,
    #[arg(global = true, short, long)]
    /// Enable verbose logging
    verbose: bool,
    #[arg(global = true, default_value = INVALID_TOKEN_DEFAULT_VALUE, short, long)]
    pub access_token: String,
}
  
fn main() {
    let args = Cli::parse();
    let mut cmd = Cli::command();
    if args.access_token.eq(INVALID_TOKEN_DEFAULT_VALUE) {
        cmd.error(
            ErrorKind::InvalidValue,
            "Please provide a valid value for access token",
        )
        .exit();
    }
    println!("{:?}", args);
}
```

This will throw an error using clap's pretty output and show the help documentation.

```
clap-test user create --username je12emy --email jeremy@example.com
error: Please provide a valid value for access token

Usage: clap-test [OPTIONS] <COMMAND>

For more information, try '--help'.
```

# Sources

This article was heavily inspired by this Youtube video by Code to the Moon.

- [Rust Command Line Argument Parsing (A Better Way With Clap by Code to the Moon)](https://youtu.be/fD9ptABVQbI)

You can check this source code in this Github repository.

- [Clap Test Github Repository](https://github.com/Je12emy/clap-test)

I wrote this article based on some learning I had from building this CLI for automating some operations in Gitlab.

- [Shears CLI](https://github.com/Je12emy/shears-cli)
