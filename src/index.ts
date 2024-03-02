import { default as Airtel } from "./Airtel";

export { Airtel };

export const create = (client_id: string, client_secret: string, country = "KE", currency = "KES", env: "live" | "sandbox" = "live", pin = "", public_key = "") => {
    return new Airtel(client_id, client_secret, country, currency, env, pin, public_key);
}

