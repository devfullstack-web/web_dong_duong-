import { MAIL_ASSETS, MAIL_BRAND } from "../constants";
import { getBaseLayout } from "./layout";

export const getApplicationConfirmationTemplate = (name: string, jobTitle: string) => {
  const content = `
    <div style="color: ${MAIL_BRAND.text}; line-height: 1.8;">
      <h2 style="color: ${MAIL_BRAND.primary}; font-size: 18px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">
        Xác nhận tiếp nhận hồ sơ ứng tuyển
      </h2>
      
      <p style="margin-bottom: 20px;">
        Xin chào <strong>${name}</strong>,
      </p>
      
      <p style="margin-bottom: 20px;">
        Cảm ơn bạn đã quan tâm và nộp hồ sơ ứng tuyển vào vị trí <span style="color: ${MAIL_BRAND.primary}; font-weight: 700; text-transform: uppercase;">${jobTitle}</span> tại <strong>Đông Dương Corporation</strong>.
      </p>
      
      <div style="background-color: ${MAIL_BRAND.background}; border-left: 4px solid ${MAIL_BRAND.primary}; padding: 20px; margin-bottom: 25px;">
        <p style="margin: 0; font-size: 13px; font-style: italic; color: ${MAIL_BRAND.muted};">
          Chúng tôi đã nhận được hồ sơ của bạn thành công. Bộ phận Tuyển dụng sẽ tiến hành xem xét các thông tin và liên hệ với bạn trong thời gian sớm nhất nếu hồ sơ của bạn phù hợp với yêu cầu công việc.
        </p>
      </div>

      <p style="margin-bottom: 10px;">
        Trong thời gian chờ đợi, bạn có thể tìm hiểu thêm về chúng tôi tại:
      </p>
      
      <ul style="margin: 0 0 25px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Website: <a href="${MAIL_ASSETS.website}" style="color: ${MAIL_BRAND.primary}; text-decoration: none;">${MAIL_ASSETS.websiteLabel}</a></li>
        <li style="margin-bottom: 8px;">Fanpage: <a href="${MAIL_ASSETS.facebook}" style="color: ${MAIL_BRAND.primary}; text-decoration: none;">${MAIL_ASSETS.facebook}</a></li>
      </ul>
      
      <p style="margin-bottom: 5px;">Trân trọng,</p>
      <p style="margin: 0; font-weight: 900; color: ${MAIL_BRAND.secondary}; text-transform: uppercase; letter-spacing: 1px;">
        Ban Tuyển dụng Đông Dương Corporation
      </p>
    </div>
  `;

  return getBaseLayout(content);
};
