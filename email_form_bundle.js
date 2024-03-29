(function() {
	function r(e, n, t) {
		function o(i, f) {
			if (!n[i]) {
				if (!e[i]) {
					var c = "function" == typeof require && require;
					if (!f && c) return c(i, !0);
					if (u) return u(i, !0);
					var a = new Error("Cannot find module '" + i + "'");
					throw ((a.code = "MODULE_NOT_FOUND"), a);
				}
				var p = (n[i] = { exports: {} });
				e[i][0].call(
					p.exports,
					function(r) {
						var n = e[i][1][r];
						return o(n || r);
					},
					p,
					p.exports,
					r,
					e,
					n,
					t
				);
			}
			return n[i].exports;
		}
		for (
			var u = "function" == typeof require && require, i = 0;
			i < t.length;
			i++
		)
			o(t[i]);
		return o;
	}
	return r;
})()(
	{
		1: [
			function(require, module, exports) {
				"use strict";

				const e = React.createElement;

				const emailjs = require("emailjs-com");

				class EmailForm extends React.Component {
					constructor(props) {
						super(props);
						this.state = {
							email: "",
							message: "",
							errors: {
								email: "",
								message: ""
							},
							formValid: false,
							sent: false
						};
					}

					handleInputChange(event) {
						event.preventDefault();
						const target = event.target;
						const name = target.name;
						const value = target.value;

						this.setState({ [name]: value, formValid: true });
					}

					sentMessage(event) {
						if (this.state.formValid) {
							event.preventDefault();

							const templateParams = {
								from_name: this.state.email,
								message_html: this.state.message
							};

							emailjs
								.send(
									"mailgun",
									"YOUR TEMPLATE ID GOES HERE",
									templateParams,
									"YOUR USER ID GOES HERE"
								)
								// This is just a response for testing, take out on deployment
								.then(response => {
									console.log("SUCCESS!", response.status, response.text);
								});

							this.setState({
								email: "",
								message: "",
								sent: true
							});
						} else {
							React.createElement("div", "Email not valid!");
						}
					}

					render() {
						return React.createElement(
							"div",
							{
								className: "email-container"
							},
							React.createElement(
								"form",
								{
									className: "email-form",
									id: this.props.id,
									name: this.props.name,
									method: this.props.method,
									action: this.props.action
								},
								React.createElement("input", {
									className: "email-input",
									type: "email",
									name: "email",
									placeholder: "Email",
									value: this.state.email,
									onChange: this.handleInputChange.bind(this),
									error: this.state.errors.email,
									required: true
								}),
								React.createElement("textarea", {
									className: "message-input",
									type: "textarea",
									id: "message",
									name: "message",
									placeholder: "Message",
									value: this.state.message,
									onChange: this.handleInputChange.bind(this),
									error: this.state.errors.message,
									required: true
								}),
								React.createElement(
									"button",
									{
										className: "submit-button",
										onClick: this.sentMessage.bind(this)
									},
									"Submit"
								)
							)
						);
					}
				}

				const domContainer = document.querySelector("#email_form");
				ReactDOM.render(e(EmailForm), domContainer);
			},
			{ "emailjs-com": 2 }
		],
		2: [
			function(require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				var EmailJSResponseStatus_1 = require("./models/EmailJSResponseStatus");
				var UI_1 = require("./services/ui/UI");
				var _userID = null;
				var _origin = "https://api.emailjs.com";
				function sendPost(url, data, headers) {
					if (headers === void 0) {
						headers = {};
					}
					return new Promise(function(resolve, reject) {
						var xhr = new XMLHttpRequest();
						xhr.addEventListener("load", function(event) {
							var responseStatus = new EmailJSResponseStatus_1.EmailJSResponseStatus(
								event.target
							);
							if (
								responseStatus.status === 200 ||
								responseStatus.text === "OK"
							) {
								resolve(responseStatus);
							} else {
								reject(responseStatus);
							}
						});
						xhr.addEventListener("error", function(event) {
							reject(
								new EmailJSResponseStatus_1.EmailJSResponseStatus(event.target)
							);
						});
						xhr.open("POST", url, true);
						for (var key in headers) {
							xhr.setRequestHeader(key, headers[key]);
						}
						xhr.send(data);
					});
				}
				function appendGoogleCaptcha(templatePrams) {
					var element = document.getElementById("g-recaptcha-response");
					if (element && element.value) {
						templatePrams["g-recaptcha-response"] = element.value;
					}
					element = null;
					return templatePrams;
				}
				/**
				 * Initiation
				 * @param {string} userID - set the EmailJS user ID
				 * @param {string} origin - set the EmailJS origin
				 */
				function init(userID, origin) {
					_userID = userID;
					_origin = origin || "https://api.emailjs.com";
				}
				exports.init = init;
				/**
				 * Send a template to the specific EmailJS service
				 * @param {string} serviceID - the EmailJS service ID
				 * @param {string} templateID - the EmailJS template ID
				 * @param {Object} templatePrams - the template params, what will be set to the EmailJS template
				 * @param {string} userID - the EmailJS user ID
				 * @returns {Promise<EmailJSResponseStatus>}
				 */
				function send(serviceID, templateID, templatePrams, userID) {
					var params = {
						lib_version: "2.3.2",
						user_id: userID || _userID,
						service_id: serviceID,
						template_id: templateID,
						template_params: appendGoogleCaptcha(templatePrams)
					};
					return sendPost(
						_origin + "/api/v1.0/email/send",
						JSON.stringify(params),
						{
							"Content-type": "application/json"
						}
					);
				}
				exports.send = send;
				/**
				 * Send a form the specific EmailJS service
				 * @param {string} serviceID - the EmailJS service ID
				 * @param {string} templateID - the EmailJS template ID
				 * @param {string | HTMLFormElement} form - the form element or selector
				 * @param {string} userID - the EmailJS user ID
				 * @returns {Promise<EmailJSResponseStatus>}
				 */
				function sendForm(serviceID, templateID, form, userID) {
					if (typeof form === "string") {
						form = document.querySelector(form);
					}
					if (!form || form.nodeName !== "FORM") {
						throw "Expected the HTML form element or the style selector of form";
					}
					UI_1.UI.progressState(form);
					var formData = new FormData(form);
					formData.append("lib_version", "2.3.2");
					formData.append("service_id", serviceID);
					formData.append("template_id", templateID);
					formData.append("user_id", userID || _userID);
					return sendPost(_origin + "/api/v1.0/email/send-form", formData).then(
						function(response) {
							UI_1.UI.successState(form);
							return response;
						},
						function(error) {
							UI_1.UI.errorState(form);
							return Promise.reject(error);
						}
					);
				}
				exports.sendForm = sendForm;
			},
			{ "./models/EmailJSResponseStatus": 3, "./services/ui/UI": 4 }
		],
		3: [
			function(require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				var EmailJSResponseStatus = /** @class */ (function() {
					function EmailJSResponseStatus(httpResponse) {
						this.status = httpResponse.status;
						this.text = httpResponse.responseText;
					}
					return EmailJSResponseStatus;
				})();
				exports.EmailJSResponseStatus = EmailJSResponseStatus;
			},
			{}
		],
		4: [
			function(require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				var UI = /** @class */ (function() {
					function UI() {}
					UI.clearAll = function(form) {
						form.classList.remove(this.PROGRESS);
						form.classList.remove(this.DONE);
						form.classList.remove(this.ERROR);
					};
					UI.progressState = function(form) {
						this.clearAll(form);
						form.classList.add(this.PROGRESS);
					};
					UI.successState = function(form) {
						form.classList.remove(this.PROGRESS);
						form.classList.add(this.DONE);
					};
					UI.errorState = function(form) {
						form.classList.remove(this.PROGRESS);
						form.classList.add(this.ERROR);
					};
					UI.PROGRESS = "emailjs-sending";
					UI.DONE = "emailjs-success";
					UI.ERROR = "emailjs-error";
					return UI;
				})();
				exports.UI = UI;
			},
			{}
		]
	},
	{},
	[1]
);
