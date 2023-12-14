interface AirtelTokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
}

interface AirtelPromptResponse {
	status: {
		code: number;
		message: string;
		success: boolean;
	};
	transaction: {
		amount: number;
		country: string;
		currency: string;
		id: string;
	};
	reference: string;
	subscriber: {
		country: string;
		currency: string;
		msisdn: string;
	};
}

interface AirtelIpnPayload {
	reference: string;
	transaction: {
		amount: number;
		country: string;
		currency: string;
		id: string;
		message?: string;
	};
	subscriber: {
		country: string;
		currency: string;
		msisdn: string;
	};
}

interface AirtelRefundResponse {
	status: {
		code: number;
		message: string;
		success: boolean;
	};
	transaction: {
		amount: number;
		country: string;
		currency: string;
		id: string;
	};
	reference: string;
	subscriber: {
		country: string;
		currency: string;
		msisdn: string;
	};
}
