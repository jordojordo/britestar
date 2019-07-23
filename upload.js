"use strict";

const Uppy = require("uppy");
const GoogleDrive = require("@uppy/google-drive");
const Dropbox = require("@uppy/dropbox");

Uppy.Core({ debug: true, autoProceed: false })
	.use(Uppy.Transloadit, {
		params: {
			auth: {
				// To avoid tampering use signatures:
				// https://transloadit.com/docs/api/#authentication
				key: "YOUR_TEMPLATE_KEY"
			},
			template_id: "YOUR_TEMPLATE_ID"
		},
		waitForEncoding: true
	})
	.use(Uppy.Dashboard, {
		trigger: "#uppy-open-modal",
		target: "body"
	})
	.use(GoogleDrive, {
		target: Uppy.Dashboard,
		companionUrl: "https://api2.transloadit.com/companion",
		companionAllowedHosts: ".transloadit.com$"
	})
	.use(Dropbox, {
		target: Uppy.Dashboard,
		companionUrl: "https://api2.transloadit.com/companion",
		companionAllowedHosts: ".transloadit.com$"
	})
	.use(Uppy.Webcam, { target: Uppy.Dashboard })
	.use(Uppy.Url, {
		target: Uppy.Dashboard,
		companionUrl: "https://api2.transloadit.com/companion",
		companionAllowedHosts: ".transloadit.com$"
	})
	.on("transloadit:result", (stepName, result) => {
		// use transloadit encoding result here.
		console.log("Result here ====>", stepName, result);
	});
