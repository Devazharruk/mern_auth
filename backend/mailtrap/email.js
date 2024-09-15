import { client, sender } from "./mailtrap.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailtemplete.js";
export const sendwelcome = async (email, name) => {
  // Validate email and name
  if (!email) {
    console.error("Error: Recipient email is missing.");
    return;
  }
  if (!name) {
    console.error("Error: Recipient name is missing.");
    return;
  }

  // Prepare recipient
  const recipient = [{ email }];

  // Sending the welcome email
  try {
    const response = await client.send({
      from: sender,
      to: recipient, // Correctly formatted array of recipient objects
      template_uuid: "e2bb1b8a-7f1c-4278-8838-8ae8efaaca00",
      template_variables: {
        company_info_name: "Blog_app_mern_stack",
        name: name,
      },
    });
    console.log("Welcome email sent successfully:", response);
  } catch (error) {
    console.error("Error sending welcome email:", error.message || error);
  }
};
export const sendmail = async (email, verificationCode) => {
  // Wrap the recipient email in an array of objects
  const recipient = [{ email }];

  // Log the template and verificationCode to ensure they are correct
  console.log("Email Template Before Replace:", VERIFICATION_EMAIL_TEMPLATE);
  console.log("Verification Code:", verificationCode);

  // Ensure the template is not undefined
  if (!VERIFICATION_EMAIL_TEMPLATE) {
    console.error("Error: VERIFICATION_EMAIL_TEMPLATE is undefined.");
    return;
  }

  // Ensure the verification code is not undefined
  if (!verificationCode) {
    console.error("Error: verificationCode is undefined.");
    return;
  }

  // Replace the verification code in the template
  let emailHtml;
  try {
    emailHtml = VERIFICATION_EMAIL_TEMPLATE.replace(
      "{verificationCode}",
      verificationCode
    );
  } catch (replaceError) {
    console.error("Error during template replacement:", replaceError);
    return;
  }

  // Log the email HTML after replacement
  console.log("Email HTML After Replace:", emailHtml);

  // Sending the email
  try {
    const response = await client.send({
      from: sender,
      to: recipient, // Using the array for recipients
      subject: "Verification Email",
      text: "Please verify your email address",
      html: emailHtml, // Using the HTML with the replaced verification code
      category: "Email Verification",
    });
    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error.message || error);
  }
};
export const sendreset = async (email, reseturl) => {
  const recipient = [{ email }];
  try {
    client.send({
      from: sender,
      to: recipient,
      subject: "Reset Password",
      text: "Please reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", reseturl),
      category: "Reset Password",
    });
  } catch (error) {
    console.log(error.message);
  }
};
export const sendsuccess = async (email) => {
  const recipient = [{ email }];
  try {
    client.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successfully",
      text: "Your password has been reset successfully",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Reset Password",
    });
  } catch (error) {
    console.log(error.message);
  }
};
