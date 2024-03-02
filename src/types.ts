export type AirtelTokenResponse = {
	access_token: string;
	expires_in: number;
	token_type: string;
};

export type AirtelPromptResponse = {
	status: {
		code: number;
		message: string;
		success: boolean;
		result_code: string;
		response_code: string;
	};
	data:{
		transaction: {
		id: string;
		status: string;
	};}
};

export type AirtelStatusResponse = {
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
};

export type AirtelIpnPayload = {
	transaction: {
		status: string;
		transaction_reference: string;
		transaction_id: string;
		msisdn: string;
		amount: string;
		currency: string;
		channel: string;
		narrative: string;
	};
};

export type AirtelRefundResponse = {
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
};
