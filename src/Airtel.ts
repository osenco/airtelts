import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import constants from "constants";

export default class Airtel {
	protected api: AxiosInstance;
	private encryptedPin: string = "";

	constructor(
		protected client_id: string,
		protected client_secret: string,
		protected country = "KE",
		protected currency = "KES",
		protected env = "live",
		protected pin = "",
		protected publicKey = "",
		protected token = ""
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

    public async generateSecurityCredential() {
        return crypto
            .publicEncrypt(
                {
                    key: this.publicKey,
                    padding: constants.RSA_PKCS1_PADDING,
                },

                Buffer.from('utf8')
            )
            .toString("base64");
    }

    public encrypt(data: string): string {
        const publicKeyResource = crypto.publicEncrypt(this.publicKey, Buffer.from('utf8'));
        if (!publicKeyResource) {
            throw new Error('Public key NOT Correct');
        }

        const encrypted = crypto.publicEncrypt(data, publicKeyResource);
        if (!encrypted) {
            throw new Error('Error encrypting with public key');
        }

        return Buffer.from(encrypted).toString('base64');
    }

    public setPin(data: string): this {
        this.encryptedPin = this.encrypt(data);
        return this;
    }

	public async user(phone: string): Promise<any> {
		try {
			const response = await this.api.get(`/standard/v1/users/${phone}`, {
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

	public async prompt(
		phone: string,
		amount: number,
		reference: string | number = Math.random()
			.toString(16)
			.slice(2, 8)
			.toUpperCase(),
		country = "KE",
		currency = "KES"
	) {
		try {
			const { data }: { data: AirtelPromptResponse } =
				await this.api.post(
					"merchant/v1/payments/",
					{
						reference,
						subscriber: {
							country,
							currency,
							msisdn: phone.slice(-9),
						},
						transaction: {
							amount,
							country,
							currency,
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

	public async disburse(
		phone: string,
		amount: number,
		reference: string | number = Math.random()
			.toString(16)
			.slice(2, 8)
			.toUpperCase(),
		fourDigitPIN: string,
		country = "KE",
		currency = "KES"
	) {
		try {
			var encryptedPIN = this.encrypt(fourDigitPIN);

			console.log("encryptedPIN", encryptedPIN);

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
