import { MAIL_BRAND, MAIL_ASSETS, MAIL_CONTACT } from "../constants";

export const getBaseLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đông Dương Corporation</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${MAIL_BRAND.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px; background-color: ${MAIL_BRAND.secondary}; border-bottom: 4px solid ${MAIL_BRAND.accent};">
              <a href="${MAIL_ASSETS.website}" target="_blank">
                <img src="${MAIL_ASSETS.logo}" alt="Đông Dương Corporation" width="70" style="display: block; margin-bottom: 15px;">
              </a>
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Đông Dương Corporation</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f1f5f9; border-top: 1px solid ${MAIL_BRAND.border};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: ${MAIL_BRAND.muted}; font-size: 11px; text-align: center; line-height: 1.5;">
                    <p style="margin: 0 0 10px; font-weight: 700; color: ${MAIL_BRAND.secondary}; text-transform: uppercase; letter-spacing: 1px;">
                      © ${new Date().getFullYear()} ${MAIL_CONTACT.company}
                    </p>
                    <p style="margin: 0;">
                      ĐỊA CHỈ: ${MAIL_CONTACT.address}<br>
                      HOTLINE: <a href="tel:${MAIL_CONTACT.hotlineRaw}" style="color: ${MAIL_BRAND.primary}; text-decoration: none; font-weight: 700;">${MAIL_CONTACT.hotline}</a><br>
                      WEBSITE: <a href="${MAIL_ASSETS.website}" style="color: ${MAIL_BRAND.primary}; text-decoration: none;">${MAIL_ASSETS.websiteLabel}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
