import { MAIL_BRAND } from "../constants";
import { getBaseLayout } from "./layout";

interface ContactData {
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
}

export const getAdminNotificationTemplate = (data: ContactData) => {
  const content = `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding-bottom: 30px;">
          <div style="display: inline-block; padding: 6px 12px; background-color: ${MAIL_BRAND.error}; color: #ffffff; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 2px;">
            YÊU CẦU MỚI
          </div>
          <h2 style="margin: 15px 0 0; color: ${MAIL_BRAND.secondary}; font-size: 20px; font-weight: 800;">Liên hệ từ website</h2>
        </td>
      </tr>
      <tr>
        <td style="background-color: ${MAIL_BRAND.background}; padding: 30px; border-radius: 4px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding-bottom: 15px; border-bottom: 1px solid ${MAIL_BRAND.border};">
                <p style="margin: 0; font-size: 11px; font-weight: 900; color: ${MAIL_BRAND.muted}; text-transform: uppercase; letter-spacing: 1px;">Khách hàng</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: ${MAIL_BRAND.secondary};">${data.name}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 15px 0; border-bottom: 1px solid ${MAIL_BRAND.border};">
                 <table border="0" cellpadding="0" cellspacing="0" width="100%">
                   <tr>
                     <td width="50%" style="vertical-align: top;">
                        <p style="margin: 0; font-size: 11px; font-weight: 900; color: ${MAIL_BRAND.muted}; text-transform: uppercase; letter-spacing: 1px;">Số điện thoại</p>
                        <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: ${MAIL_BRAND.text};">${data.phone}</p>
                     </td>
                     <td width="50%" style="vertical-align: top; padding-left: 20px;">
                        <p style="margin: 0; font-size: 11px; font-weight: 900; color: ${MAIL_BRAND.muted}; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                        <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600; color: ${MAIL_BRAND.text};">${data.email}</p>
                     </td>
                   </tr>
                 </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 15px 0; border-bottom: 1px solid ${MAIL_BRAND.border};">
                <p style="margin: 0; font-size: 11px; font-weight: 900; color: ${MAIL_BRAND.muted}; text-transform: uppercase; letter-spacing: 1px;">Địa chỉ</p>
                <p style="margin: 4px 0 0; font-size: 14px; color: ${MAIL_BRAND.text}; line-height: 1.4;">${data.address}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 15px;">
                <p style="margin: 0; font-size: 11px; font-weight: 900; color: ${MAIL_BRAND.muted}; text-transform: uppercase; letter-spacing: 1px;">Nội dung yêu cầu</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: ${MAIL_BRAND.text}; line-height: 1.6; background-color: #ffffff; padding: 15px; border: 1px solid ${MAIL_BRAND.border}; border-radius: 4px;">
                  ${data.message}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
  
  return getBaseLayout(content);
};
