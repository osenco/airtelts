import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import constants from "constants";

/**
 * Main Airtel Africa class that is the core of the SDK
 */
export default class Airtel {
	protected api: AxiosInstance;
	protected token = "";

	/**
	 * Setup Airtel class
	 *
	 * @param client_id App client ID
	 * @param client_secret App client secret
	 * @param country Country code
	 * @param currency Currency code
	 * @param env Environment
	 * @param pin (optional) A 4 digit PIN
	 * @param public_key (optional) A public key string used to encrypt the PIN
	 */
	constructor(
		protected client_id: string,
		protected client_secret: string,
		protected country = "KE",
		protected currency = "KES",
		protected env: "live" | "sandbox" = "live",
		protected pin = "",
		protected public_key = ""
	) {
		this.api = axios.create({
			baseURL:
				env === "sandbox"
					? "https://openapiuat.airtel.africa"
					: "https://openapi.airtel.africa",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Authorize Airtel and get access token
	 *
	 * @returns Airtel
	 */
	public async authorize(): Promise<Airtel> {
		try {
			const { data }: { data: AirtelTokenResponse } = await this.api.post(
				"auth/oauth2/token",
				{
					client_id: this.client_id,
					client_secret: this.client_secret,
					grant_type: "client_credentials",
				}
			);

			if (data.access_token) {
				this.token = data.access_token;
			}
		} catch (error) {}

		return this;
	}

	/**
	 * Encrypt data using the public key
	 *
	 * @param data string
	 * @returns string
	 * @throws Error
	 * @see https://stackoverflow.com/a/60370250/6782707
	 */
	public encrypt(data: string): string {
		const public_keyResource = crypto.publicEncrypt(
			{
				key: this.public_key,
				padding: constants.RSA_PKCS1_PADDING,
			},
			Buffer.from("utf8")
		);

		if (!public_keyResource) {
			throw new Error("Public key NOT Correct");
		}

		const encrypted = crypto.publicEncrypt(data, public_keyResource);
		if (!encrypted) {
			throw new Error("Error encrypting with public key");
		}

		return Buffer.from(encrypted).toString("base64");
	}

	/**
	 * Get user details from Airtel using phone number
	 *
	 * @param phone string
	 * @returns
	 */
	public async user(phone: string): Promise<any> {
		try {
			const response = await this.api.get(`standard/v1/users/${phone}`, {
				headers: {
					"Content-Type": "application/json",
					"X-Country": this.country,
					"X-Currency": this.currency,
					Authorization: `Bearer ${this.token}`,
				},
				data: {},
			});

			return response.data;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Send a USSD prompt to a user to process a payment by entering their PIN
	 *
	 * @param phone Phone number to charge
	 * @param amount Amount to be paid
	 * @param reference Unique transaction reference, can be left blank to generate a random one
	 * @returns Promise<AirtelPromptResponse>
	 */
	public async prompt(
		phone: string,
		amount: number,
		reference: string | number = Math.random()
			.toString(16)
			.slice(2, 8)
			.toUpperCase()
	): Promise<AirtelPromptResponse> {
		try {
			const { data }: { data: AirtelPromptResponse } =
				await this.api.post(
					"merchant/v1/payments/",
					{
						reference,
						subscriber: {
							country: this.country,
							currency: this.currency,
							msisdn: phone.slice(-9),
						},
						transaction: {
							amount,
							country: this.country,
							currency: this.currency,
							id: reference,
						},
					},
					{
						headers: {
							"X-Country": this.country,
							"X-Currency": this.currency,
							Authorization: `Bearer ${this.token}`,
						},
					}
				);

			if (data.status.success) {
				return data;
			} else {
				throw new Error(data.status.message);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Check transaction status
	 *
	 * @param airtel_money_id Airtel Money transaction ID
	 * @param type Transaction type, payment or disbursement
	 * @returns
	 */
	public async status(
		airtel_money_id: string,
		type: "payment" | "disbursement" = "payment"
	) {
		const endpoint =
			type === "payment"
				? `standard/v1/payments/${airtel_money_id}`
				: `standard/v1/disbursements/${airtel_money_id}`;

		try {
			const { data }: { data: AirtelPromptResponse } = await this.api.get(
				endpoint,
				{
					headers: {
						Authorization: `Bearer ${this.token}`,
						"X-Country": this.country,
						"X-Currency": this.currency,
					},
				}
			);

			if (data.status.success) {
				return data;
			} else {
				throw new Error(data.status.message);
			}
		} catch (error) {}
	}

	/**
	 * Refund a transaction
	 *
	 * @param airtel_money_id Airtel Money transaction ID
	 * @param type Transaction type - either payment or disbursement
	 * @returns
	 */
	public async refund(
		airtel_money_id: string,
		type: "payment" | "disbursement" = "payment"
	) {
		const endpoint =
			type === "payment"
				? "standard/v1/payments/refund"
				: "standard/v1/disbursements/refund";

		try {
			const { data }: { data: AirtelRefundResponse } =
				await this.api.post(
					endpoint,
					{
						transaction: {
							airtel_money_id,
						},
					},
					{
						headers: {
							Authorization: `Bearer ${this.token}`,
							"X-Country": this.country,
							"X-Currency": this.currency,
						},
					}
				);

			if (data.status.success) {
				return data;
			} else {
				throw new Error(data.status.message);
			}
		} catch (error) {}
	}

	/**
	 * Disburse funds to a user
	 *
	 * @param phone Phone number to disburse to
	 * @param amount Amount to disburse
	 * @param reference Unique transaction reference, can be left blank to generate a random one
	 * @returns
	 */
	public async disburse(
		phone: string,
		amount: number,
		reference: string | number = Math.random()
			.toString(16)
			.slice(2, 8)
			.toUpperCase()
	) {
		try {
			const encryptedPIN = this.encrypt(this.pin);

			const { data }: { data: AirtelPromptResponse } =
				await this.api.post(
					"standard/v1/disbursements/",
					{
						payee: {
							msisdn: phone.slice(-9),
						},
						reference: reference,
						pin: encryptedPIN,
						transaction: {
							amount: amount,
							id: reference,
						},
					},
					{
						headers: {
							"X-Country": this.country,
							"X-Currency": this.currency,
							Authorization: `Bearer ${this.token}`,
						},
					}
				);

			if (data.status.success) {
				return data;
			} else {
				throw new Error(data.status.message);
			}
		} catch (error) {}
	}

	/**
	 * Reconcile a transaction
	 *
	 * @param response Airtel IPN payload
	 * @param callback Callback function
	 * @returns
	 */
	public async reconcile(
		response: AirtelIpnPayload,
		callback: CallableFunction | null = null
	) {
		if (!response["transaction"]) {
			throw new Error("No transaction data received");
		}

		const transaction = response["transaction"]["id"] ?? "";
		const message = response["transaction"]["message"] ?? "";

		if (!transaction) {
			throw new Error(message);
		}

		if (callback) {
			callback(response);
		}

		return response;
	}
}
