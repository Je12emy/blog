---
title: "How to run Starcraft 2 in Linux"
description: "A not detailed guide for how to run Starcraft 2 in Linux"
pubDate: "Dic 09 2023"
---

I'm on an RTS itch lately, so naturally, I decided to play Starcraft 2. Sadly, Steam can't help us out with that so we must rely on some other ways. So, I decided to document how I got thing working on my set-up.

# The Distribution

I switched to Arch recently (btw), so instruction asume you are also using an arch based distribution, I will also be using [paru](https://github.com/Morganamilo/paru) as my AUR helper. You might be able to infer your distribution's equivalent.

# Drivers

I'm using an AMD RX480 8GB GPU, I heard NVIDIA is a mess in Linux, so I'm glad I went for team red on my build many years ago. [Install the Vulkan drivers](https://wiki.archlinux.org/title/Vulkan#Installation).

```shell
paru vulkan-radeon lib32-vulkan-radeon
```

# Software

Since steam can't help us run our games through proton, we must emulate with Wine. I have no idea how to use Wine, but I've used [Lutris](https://lutris.net/).

```shell
paru lutris
```

# Lutris

## Wine Dependencies

There are some dependencies for installing Battlenet, check for your [distribution specific instructions here](https://github.com/lutris/docs/blob/master/WineDependencies.md).

```Shell
sudo pacman -S --needed wine-staging giflib lib32-giflib libpng lib32-libpng libldap lib32-libldap gnutls lib32-gnutls \
mpg123 lib32-mpg123 openal lib32-openal v4l-utils lib32-v4l-utils libpulse lib32-libpulse libgpg-error \
lib32-libgpg-error alsa-plugins lib32-alsa-plugins alsa-lib lib32-alsa-lib libjpeg-turbo lib32-libjpeg-turbo \
sqlite lib32-sqlite libxcomposite lib32-libxcomposite libxinerama lib32-libgcrypt libgcrypt lib32-libxinerama \
ncurses lib32-ncurses ocl-icd lib32-ocl-icd libxslt lib32-libxslt libva lib32-libva gtk3 \
lib32-gtk3 gst-plugins-base-libs lib32-gst-plugins-base-libs vulkan-icd-loader lib32-vulkan-icd-loader
```

## The Installer

We are close.

1. Open Lutris.
2. Click on the "Add Game" icon, on the top left corner of Lutris.
3. Click on "Search the Lutris website for installers", this should be the first option available.
4. Enter "Battlenet" in the search box.
5. Click on "Install".

Take note that installer instructs you to not login to Battle.net during the installation process.

# Conclusion

That's pretty much it, it sounds more intimidating that it is. Just copy and paste a bunch of pacman commands, click a bunch of buttons and you are good to go! I mostly wanted to write this in order to share some knowledge.
