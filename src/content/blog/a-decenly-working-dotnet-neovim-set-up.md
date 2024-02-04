---
title: "A decently working .NET + Neovim set-up"
description: "Yes, it is possible. You may uninstall Visual Studio."
pubDate: "Feb 04 2024"
---

I'll be honest, C# and .Net Core is kind off neat. Having to rely on Visual Studio or Visual Studio Code is not, and I don't want to pay for JetBrains Rider (though it is much better than VS). I'm also forced to use Windows for work (yuck), so I'd say my development environment has left me with a bad taste of C#. So, how do you set-up a development environment for .NET is neovim?

# Picking the right LSP

There are a bunch of options for dotnet's LSP, when you visit the nvim LSP servers for dotnet you will find two options.

- [c-sharpls](https://github.com/neovim/nvim-lspconfig/blob/master/doc/server_configurations.md#csharp_ls).
- [omnisharp](https://github.com/neovim/nvim-lspconfig/blob/master/doc/server_configurations.md#omnisharp).

I believe that omnisharp is the one being used by VS, but to be honest... for neovim, its horrible. Stick with c-sharpls, I do think that Microsoft is working on a more LSP friendly plugin, but I have no idea if it has support for neovim, it isn't listed in the nvim LSP documentation yet. You can configure you LSP however you prefer, I use mason.nvim.

```lua
require("mason").setup()
require("mason-lspconfig").setup({
    handlers = {
        function(server_name) -- default handler (optional)
            require("lspconfig")[server_name].setup {
                on_attach = function()
                    -- Your callback function
                end,
            }
        end
    }
})
```

This is good enough for the most basic applications if you are learning C#, but there is a chance you need to explore some library's definition. This is where another plugin comes into play for decompiling these sources: [c-sharp-extended-lsp](https://github.com/Decodetalkers/csharpls-extended-lsp.nvim?tab=readme-ov-file). You can read its documentation for more details and set-up, but this is how I have set-up it up along side mason.nvim.

```lua
require("mason-lspconfig").setup({
    handlers = {
        function(server_name) -- default handler (optional)
            require("lspconfig")[server_name].setup {
                on_attach = on_attach,
                capabilities = capabilities
            }
        end,
        csharp_ls = function()
            require 'lspconfig'.csharp_ls.setup {
                on_attach = on_attach,
                handlers = {
                    ["textDocument/definition"] = require('csharpls_extended').handler,
                    ["textDocument/typeDefinition"] = require('csharpls_extended').handler,
                },
            }
        end,
    }
})
```

We are close to ditching Visual Studio! How about debugging?

# Debugging the netcoredbg

Debugging in neovim is possibly an intimidating topic, but it's actually really simple, here's an article I wrote on how you can do it in C. The same process is valid for dotnet, we must install a debugger and just copy and paste the according nvim dap set-up.

I believe that Microsoft has not mode available their debugger for Visual Studio, but [netcoredbg](https://github.com/Samsung/netcoredbg) seems like a good enough alternative. Installation in Linux is a bit tricky, the AUR package does not work (I do want to package it myself), so you must following the compilation steps.

After installing `netcoredbg`, copy and paste the [nvim dap snippet](https://github.com/mfussenegger/nvim-dap/wiki/Debug-Adapter-installation#dotnet).

```lua
local dap = require("dap")

-- Feel free to set-up your keybinds here

dap.adapters.coreclr = {
    type = 'executable',
    -- You may want to tweak this based on your PC
    command = '/path/to/netcoredbg',
    args = { '--interpreter=vscode' }
}

dap.configurations.cs = {
    {
        type = "coreclr",
        name = "launch - netcoredbg",
        request = "launch",
        program = function()
            return vim.fn.input('Path to dll', vim.fn.getcwd() .. '/bin/Debug/', 'file')
        end,
    },
}
```

# Conclusion

That's pretty much it! You have a working LSP with decompilation capabilities and a debugger. I still have some tinkering to do and trully field test this puppy. I'm just glad I can make development environment closer to what I prefer on my local work-station.
