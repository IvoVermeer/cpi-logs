# CPI Logs

Welcome to cpi-logs, a web-based tool to monitor runtime artifacts deployed on SAP Cloud Platform Integration. This tool will download attachments added to log-entries in your integration flows. Combined with the correct text-editor, it will allow you to inspect your integration in more detail.

This tool was built to support analysis of integrations during build and test. But if your integration is built with this tool in mind, it could also be used in a productive environment.

# Features

- Mutliple tenant support
- View deployed artifacts
- Filter artifact view
- Download log-files of a single atrifact with one click
- Download atrifact deployment

# Requirements

To be able to install and use this tool, you need to have Node.js installed, you can get it at https://nodejs.org. Node.js is a Javascript runtime library allowing javascript to run on your device outside of a browser. It comes with `npm`, the Node Package Manager. This tool allows you to install Node modules such as `cpi-logs`

# Instalation

You have two installation options, either from the NPM or by cloning the github repo.

**npm**

Run `npm install -g cpi-logs` from your favorite command line

**Clone repo**

Clone the repository by running `git clone https://github.com/ivovermeer/cpi-logs`. After downloading the repo, either install it globally with npm by runnning `npm install -g .` in the folder the repo was downloaded to, or run `npm install` once and then start the app with `npm start`

# Usage

## Start the app

Start your favorite commandline program and run `cpi-logs`. Your browser should automatically open. If that's not the case, open your browser and go to http://localhost:3000

## Initial start

When you first run the app, it will ask you to add a tenant. Fill in the information:

- _Name_ The name you would want to use for this tenant
- _URL_ The url to your tenant. You can copy the address from your browser and paste it in. The app will truncate it to the required origin
- _Log file folder_ A location on your computer where the log-files should be stored.
- _Username_ The user with which the app will log on. The app currently only support basic authentication
- _Password_ The password for the user. The password and username will be converted into a base64 encoded string

These settings will be saved in a file called `cpi-log-settings.json` in your user's home-folder. Think about this for yourself before you use this app; Anyone with access to that file ultimatly hass access to your s-user's password!

## Views

**Tenants**

This is the main view and the view you will return to when you click the CPI Logging link at the top of th screen. Each tenant provides a link to CPI for quick access. The button **Artifacts** will show an overview of all deployed artifacts for that tenant.

By clicking **Edit**, you can edit the tenant's details and also delete the tenant from your configuration. Deleting the tenant will remove **all** configuration for that tenant, including the last run dates for its artifacts. Deleting all tenants effectivly initializes the configuration file.

There is a +-button to add a new tenant.

**Artifacts**

The artfact overview shows you all deployed artifacts sorted descending by deployment date. You can filter the artifacts by title. The refresh button will fetch the latest status of all artifacts, handy when you're waiting for a deployment to be finished. _Clicking refresh will re-render all artifacts. This will probably result in a different date-format shown on screen. This is a known issue_

Each artifact holds a `Last run date` value which is initially empty. This is the date as of which the artifact's logs will be read from CPI, the format it `yyyy-MM-ddTHH:mm:ss`. If the date is empty it will fetch the last 10 log entries.
_Due to the difference between the date format in OData $filter oparation and how CPI stores the date on each entry, it will dowload the last log you have locally again. CPI stores milliseconds on the log-entry while the OData $filter operation only goed down to the second_

Click 'Refresh Logs' will fetch the **attachments** of all log-entries for that artifacts based on the last run date(see above). The logs will be downloaded to the folder you set in the tenant-settings screen. The location is: **tenant-folder**\\**artifact-id**\\**entry-date**-**entry-id**

Refreshing the logs may take some time, it depends on the size af the attachments and the speed of your internet connection, to name a few things.

The extension of each attachment will be determined by the mime-type that was set when the attachment was added in the flow. Make sure you set the mine-type correcttly (ie. text/plain, application/xml, etc) in the flow when adding attachments.

The button 'Backup' will download a zip-file of the deployed version of the artifact.

# Issues / Feature request

If you find any issues, please log an issue on Github. If you have a feature request, or a suggestion to improve the app, please feel free to log an issue for that.

# Contributing

If you like to contribute to the app, please feel free to fork, improve and submit a PR. I develop this app in my free time which is limited, so don't expect me to respond too fast 😁

run `npm test` to start the app. The browser will open automatically.

Some rules before creating a PR:

- Make sure you're comfortable with all modules used (check `package.json`)
- use a ESLint plugin in your editor
- use a prettier plugin in your editor
- when adding features, please check in with me before starting😊
