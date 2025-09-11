import { NotificationRequestItem } from "../typings/notification/models";
type DataToSign = NotificationRequestItem | {
    [key: string]: string;
};
declare class HmacValidator {
    static HMAC_SHA256_ALGORITHM: string;
    static DATA_SEPARATOR: string;
    /**
     * Calculate HMAC signature of the payload data
     * @param data payload as String or as NotificationRequestItem
     * @param key HMAC key
     * @returns HMAC signature
     */
    calculateHmac(data: string | NotificationRequestItem, key: string): string;
    /**
     * @deprecated use Use validateHMACSignature with correct parameter order instead
     * Validate HMAC signature for Banking webhooks
     * @param hmacKey
     * @param hmacSign
     * @param notification
     * @returns
     */
    validateBankingHMAC(hmacKey: string, hmacSign: string, notification: string): boolean;
    /**
     * Validate HMAC signature for Banking/Management webhooks
     * @param hmacKey HMAC key
     * @param hmacSignature HMAC signature to validate
     * @param data webhook payload (as string)
     * @returns true when HMAC signature is valid
     */
    validateHMACSignature(hmacKey: string, hmacSignature: string, data: string): boolean;
    /**
     * Validate HMAC signature for Payment webhooks
     * @param notificationRequestItem webhook payload (as NotificationRequestItem object)
     * @param key HMAC key
     * @returns true when HMAC signature is valid
     */
    validateHMAC(notificationRequestItem: NotificationRequestItem, key: string): boolean;
    private isNotificationRequestItem;
    /**
     * extract fields to be used to calculate the HMAC signature
     * @param notificationRequestItem webhook payload
     * @returns data to sign (as string)
     */
    getDataToSign(notificationRequestItem: DataToSign): string;
    calculateHmacSignature(data: string, key: string): string;
}
export default HmacValidator;
