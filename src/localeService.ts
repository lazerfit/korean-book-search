import { getLanguage } from 'obsidian';
import { koMessages } from '../locales/ko/messages';
import { enMessages } from '../locales/en/messages';

export interface LocaleMessages {
	APIkeySaved: {
		message: string;
		description: string;
	};
	APIkeyError: {
		message: string;
		description: string;
	};
	APIKeyEnter: {
		message: string;
		description: string;
	};
	APIKeyNotSet: {
		message: string;
		description: string;
	};
	include_myRate: {
		message: string;
		description: string;
	};
	include_status: {
		message: string;
		description: string;
	};
	include_startReadDate: {
		message: string;
		description: string;
	};
	include_finishReadDate: {
		message: string;
		description: string;
	};
	splitSubTitle: {
		message: string;
		description: string;
	};
	customFrontmatter: {
		message: string;
		description: string;
	};
	updateBookInfoProcessing: {
		message: string;
		description: string;
	};
	updateBookInfoProcessingError: {
		message: string;
		description: string;
	};
	updateBookInfoSuccess: {
		message: string;
		description: string;
	};
	updateBookInfoError: {
		message: string;
		description: string;
	};
	updateFrontmatterError: {
		message: string;
		description: string;
	};
	SearchBookError: {
		message: string;
		description: string;
	};
	SearchBookTitleError: {
		message: string;
		description: string;
	};
	SearchBookFetchingError: {
		message: string;
		description: string;
	};
}

const localeMap: Record<string, LocaleMessages> = {
	en: enMessages,
	ko: koMessages,
};

export const getLocaleMessage = (key: keyof LocaleMessages, description: boolean = false) => {
	const language = getLanguage();
	const userLocale = localeMap[language || 'en'];
	return description ? userLocale[key].description : userLocale[key].message;
};
