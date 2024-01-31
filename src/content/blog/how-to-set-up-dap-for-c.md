---
title: "How to set-up debugging in neovim for C"
description: "Everyone thinks that debugging is impossible in neovim, actually... it's pretty simple"
pubDate: "Jan 31 2024"
---

# Context

Sooo... I'm currently learning C. I've grown tired of the online discourse about "Which is the best programming language to learn". Is it Rust, Go, Ocaml, Typescript? All options are good, just pick whatever you feel good codding in. In my case, I've been spoiled by Javascript for too long, maybe so much that I've neglected a ton of CS basics like algorithms. So I decided to pick up C. I've never programmed C, only a tiny bit of C++ (they are NOT the same, I know). I'm having a ton of with C, I'm currently reading [Modern C](https://www.amazon.com/Modern-C-Jens-Gustedt/dp/1617295817/ref=sr_1_1?keywords=modern+C&qid=1706664951&sr=8-1), though at a slow pase since I do want to complete all the challenges. 

I've also used neovim for a while, which is awesome, but I've never gotten around setting up debugging, I've always relied on VSCode or some other IDE for that. Not anymore! 

# How to set-up debugging in Neovim for C

Let's first thing of what debugging is... Now, I'm not an expert and modern IDE's have abstracted this concept for us behind a neat "Play" button. A debugger is just a program which runs your code. Actually, [here is a list of debuggers](https://microsoft.github.io/debug-adapter-protocol/implementors/adapters/) if you would like to check it out.

For C in Linux there is [gdb](https://www.gnu.org/software/gdb/). So, let's start at the lowest level and build our way up for an IDE like experience.

## The GNU Project Debugger (GDB)

On linux, there is a good chance you might already have this program installed. Open up terminal and type `gdb`.

```Shell
$ gdb

# GNU gdb (GDB) 14.1
# Copyright (C) 2023 Free Software Foundation, Inc.
# License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
# This is free software: you are free to change and redistribute it.
# There is NO WARRANTY, to the extent permitted by law.
# Type "show copying" and "show warranty" for details.
# This GDB was configured as "x86_64-pc-linux-gnu".
# Type "show configuration" for configuration details.
# For bug reporting instructions, please see:
# <https://www.gnu.org/software/gdb/bugs/>.
# Find the GDB manual and other documentation resources online at:
#     <http://www.gnu.org/software/gdb/documentation/>.
# --Type <RET> for more, q to quit, c to continue without paging--
```

Congrats! We are almost there. As I told you, we need a program for gdb to run. So let's write a C program and compile it.

```C
// hello-world.c
#include <stdio.h>
#include <stdlib.>

int main() {
    printf("Hello World");
    return EXIT_SUCCESS;
}
```

Open a terminal an navigate to this file's directory. When compiling with [gcc](https://gcc.gnu.org/) we must include debugging information, this can be simply done with the `-g` flag.

```Shell
$ gcc hello-world.c -g
# This should output a.out
```

Now, we can pass this executable to gdb as an argument.

```Shell
# Check the current directory's contents
$ ls
a.out  hello-world.c
# Pass a.out to gdb
$ gdb a.out
```

Good job! gdb is an interactive program, so you might want to get familiar with it. Run the `help` command to read the program's documentation. For now, we will run the following commands.

Use `list` to show your program's source code.

```Shell
(gdb) list
1       #include <stdio.h>
2       #include <stdlib.h>
3
4       int main() {
5         printf("Hello World!");
6         return EXIT_SUCCESS;
7       }
(gdb)
```

I would like to insert a breakpoint in line 5. Run the `break <line-number>` command to, as you might guess it, insert a breakpoint on a given line.

```Shel
(gdb) break 5
Breakpoint 1 at 0x113d: file hello-world.c, line 5.
```

Great, let's run our program! Run the `run` command.

```Shell
(gdb) run
Starting program: /somewhere/c-debugging-demo/a.out

Breakpoint 1, main () at hello-world.c:5
5         printf("Hello World!");
(gdb)
```

You just hit a breakpoint! We are effectively, debugging our C program. You can run the `step` command to step over the next line of code or the `continue` command to continue to the next breakpoint (there isn't one, so execution will finish).

This is all the magic that IDEs are hiding away from us. Its really cool to finally look what is happening under the hood right? If you are happy you could just rely on gdb but let's see what neovim can do for us.

## NVIM DAP and DAP UI

Let's now dig into our neovim configuration, there are many ways you can set-up and download your plugins. In my case, I'm using [lazy.nvim](https://github.com/folke/lazy.nvim), but any other method should be good. There are two plugins which we will rely on.

### NVIM DAP set-up

Think of [Nvim-dap](https://github.com/mfussenegger/nvim-dap) as the LSP client equivalent for debugging, it is actually named "Debug Adapter Protocol". Set-up is fairly similar to the one you might to for your LSP clients, there are some code snippets for each language. I'll copy and paste the [one provided for C with GDB](https://github.com/mfussenegger/nvim-dap/wiki/Debug-Adapter-installation#ccrust-via-gdb).

```lua
return {
            {
                "mfussenegger/nvim-dap",
                config = function()
                    local dap = require("dap")
                    -- Feel free to set-up your keybinds somewhere in here

                    dap.adapters.gdb = {
                        type = "executable",
                        command = "gdb",
                        args = { "-i", "dap" }
                    }

                    dap.configurations.c = {
                        {
                            name = "Launch",
                            type = "gdb",
                            request = "launch",
                            program = function()
                                return vim.fn.input('Path to executable: ', vim.fn.getcwd() .. '/', 'file')
                            end,
                            cwd = "${workspaceFolder}",
                        },
                    }
                end,
            }
}
```

Good news, this is pretty much all we need to do. Let your package manager download the plugin and open the C program we just wrote. Here we will use some commands similar to the ones we used in `gdb`. Place your cursor in line 5 and in normal mode and enter the command `:DapToggleBreakpoint`. Take sometime to familiarize yourself with nvim-dap's commands, there isn't some sort of `run` command though, to run our program we will run the `:DapContinue` command to start our debugging session. Here a message will show up: "Path to executable", enter the name of the executable we just compiled. Yes, you are actually just passing `a.out` to `gdb`!

Good job! If you have kept an eye in your line number column, some symbols maybe have shown up when you ran these commands. A right arrow indicates that you have hit a breakpoint. You can continue interacting with the debugger with some commands similar to those you used in gdb.

- `DapContinue`.
- `DapStepOver`.
- `DapStepInto`.
- `DapStepOut`.

Congrats! DAP is working, but it could be a bit better right?

### DAP UI set-up

You might be familiar with the debugging interface provided by modern IDEs, good thing is, this is also possible with [nvim-dap-ui](https://github.com/rcarriga/nvim-dap-ui). Actually, you don't need to do anything else after installing this plugin. You can open the UI manually by running the following command: `lua require "dapui".open()` either manually or through a keybind. Again, this is just a UI plugin, all functionality is managed through nvim-dap.

# Conclusion

With this guide, I hope to have though you the basics of how to set-up a debugging environment within neovim. It was great for me to build my knowledge up first through `gdb` and slowly integrate plugins into neovim. This really cleared up the black box that was hidden by other IDEs. If you need any reference, here is my DAP configuration [within my neovim dotfiles](https://github.com/Je12emy/dotfiles/blob/8ea2b12b71be2377a66673f89db384d2f901a83e/config/nvim/lua/je12emy/plugins/editor/dap.lua).
