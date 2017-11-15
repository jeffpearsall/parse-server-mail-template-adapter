import fs from 'fs';

let replacePlaceHolder = (text, options) => {
  return text.replace(/%email%/g, options.user.get("email"))
            .replace(/%username%/g, options.user.get("username"))
            .replace(/%appname%/g, options.appName)
            .replace(/%link%/g, options.link);
}


let MailTemplateAdapter = mailOptions => {
  if (!mailOptions || !mailOptions.adapter) {
    throw 'MailTemplateAdapter requires an adapter.';
  }
  var adapter = mailOptions.adapter;

  if (!mailOptions.template) {
    return adapter;
  }

  var customized = {}


  if (mailOptions.template.verification) {
    var verification = mailOptions.template.verification;

    if (!verification.subject) {
      throw 'MailTemplateAdapter verification requires subject.';
    }
    var verificationSubject = verification.subject;
    var verificationText = "";
	var verificationHtml;
	var payload;

    if (verification.body) {
      verificationText = verification.body;
    }
	else if (verification.html) {
      verificationHtml = verification.html;       
    }
    else if (verification.bodyFile) {
      verificationText = fs.readFileSync(verification.bodyFile, "utf8");        
    }
    else {
      throw 'MailTemplateAdapter verification requires body.';
    }

    customized.sendVerificationEmail = function(options) {
      return new Promise((resolve, reject) => {

        var to = options.user.get("email");
        var html = replacePlaceHolder(verificationHtml, options);
		var text = replacePlaceHolder(verificationText, options);
        var subject = replacePlaceHolder(verificationSubject, options);
		if(verificationHtml){
			payload = { html: html, to: to, subject: subject }
		}else{
			payload = { text: text, to: to, subject: subject }
		}

        this.sendMail(payload).then(json => {
          resolve(json);
        }, err => {
          reject(err);
        });
      });
    };
  }

  if (mailOptions.template.resetPassword) {
    var resetPassword = mailOptions.template.resetPassword;

    if (!resetPassword.subject) {
      throw 'MailTemplateAdapter resetPassword requires subject.';
    }
    var resetPasswordSubject = resetPassword.subject;
    var resetPasswordText = "";
	var resetPasswordHtml;
	var payload;

    if (resetPassword.body) {
      resetPasswordText = resetPassword.body;
    }
	else if (verification.html) {
      resetPasswordHtml = verification.html;       
    }
    else if (resetPassword.bodyFile) {
      resetPasswordText = fs.readFileSync(resetPassword.bodyFile, "utf8");        
    }
    else {
      throw 'MailTemplateAdapter resetPassword requires body.';
    }

    customized.sendPasswordResetEmail = function(options) {
      return new Promise((resolve, reject) => {

        var to = options.user.get("email");
		var html = replacePlaceHolder(resetPasswordHtml, options);
        var text = replacePlaceHolder(resetPasswordText, options);
        var subject = replacePlaceHolder(resetPasswordSubject, options);
		if(resetPasswordHtml){
			payload = { html: html, to: to, subject: subject }
		}else{
			payload = { text: text, to: to, subject: subject }
		}

        this.sendMail(payload).then(json => {
          resolve(json);
        }, err => {
          reject(err);
        });
      });
    };
  }


  return Object.freeze(Object.assign(customized, adapter));
}

module.exports = MailTemplateAdapter