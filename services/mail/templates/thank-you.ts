import { MAIL_BRAND } from "../constants";
import { getBaseLayout } from "./layout";

export const getThankYouTemplate = (name: string, email: string) => {
  const content = `
    <h2 style="margin: 0 0 20px; color: ${MAIL_BRAND.secondary}; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Chào ${name},</h2>
    <p style="margin: 0 0 25px; color: ${MAIL_BRAND.text}; font-size: 16px; line-height: 1.6;">
      Cảm ơn bạn đã quan tâm và gửi yêu cầu tư vấn tới <strong>Đông Dương Corporation</strong>. Chúng tôi đã nhận được thông tin liên hệ của bạn.
    </p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${MAIL_BRAND.background}; border-left: 4px solid ${MAIL_BRAND.accent}; border-radius: 2px;">
      <tr>
        <td style="padding: 24px;">
          <h3 style="margin: 0 0 12px; color: ${MAIL_BRAND.primary}; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Thông tin đã ghi nhận:</h3>
          <p style="margin: 0; color: ${MAIL_BRAND.text}; font-size: 15px;">
            <strong style="color: ${MAIL_BRAND.muted};">HỌ TÊN:</strong> ${name}<br>
            <strong style="color: ${MAIL_BRAND.muted};">EMAIL:</strong> ${email}
          </p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 25px 0 0; color: ${MAIL_BRAND.text}; font-size: 16px; line-height: 1.6;">
      Chuyên viên kỹ thuật của chúng tôi đang xem xét yêu cầu và sẽ phản hồi cho bạn trong thời gian sớm nhất. 
    </p>
    
    <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid ${MAIL_BRAND.border};">
      <p style="margin: 0; color: ${MAIL_BRAND.muted}; font-size: 14px; font-style: italic;">
        Trân trọng,<br>
        <strong style="color: ${MAIL_BRAND.secondary}; font-style: normal;">Đội ngũ Đông Dương Corporation</strong>
      </p>
    </div>
  `;
  
  return getBaseLayout(content);
};
