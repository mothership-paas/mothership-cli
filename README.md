![Mothership](https://imgur.com/6InUcxa.png)

<h1 align="center">🛸 Mothership CLI</h1>

<p align="center">CLI client for creating, deploying, and managing Mothership applications</p>

## Setup

1. Clone repo
2. `cd` into repo
3. Run `yarn install`
4. Run `yarn link`

Mothership commands should now be available from your command line.

## Commands

(At this time all commands assume Mothership is running on `localhost:3000`)

| Command | Action |
|---------|--------|
| `mothership help` | Display list of CLI commands |
| `mothership list` | Display list of Mothership's apps |
| `mothership create appname` | Create an app named `'appname'` |
| `mothership deploy appname` | Deploy **current directory** to `'appname'` |
| `mothership logs appname` | Load and stream logs for `'appname'` |
