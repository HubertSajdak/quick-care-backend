import { t } from "i18next";

class CustomAPIError extends Error {
	constructor(message: string) {
		super(t(message));
	}
}

export default CustomAPIError;
