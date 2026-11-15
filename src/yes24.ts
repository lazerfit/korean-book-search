// YES24 Open API response handling. No Obsidian imports, so it runs under plain Node for the test.
// Docs: https://developers.yes24.com/api-doc/goods-item-list

export interface BookMetadata {
	itemId: number;
	title: string;
	subTitle?: string;
	author: string;
	publisher: string;
	isbn13: string;
	publishDate: string;
	pages?: number;
	cover: string;
	link: string;
}

export interface Yes24Response {
	success: boolean;
	errorCode: string | null;
	data: { items?: BookMetadata[] } | null;
}

export type Yes24Error = 'APIKeyInvalid' | 'SearchBookTitleError' | 'SearchBookError';

/** First item of a response, or the locale key of the error to show. */
export const firstItem = (body: Yes24Response): BookMetadata | Yes24Error => {
	const code = body.errorCode ?? '';
	if (code.startsWith('AUTH_')) return 'APIKeyInvalid';
	if (code.startsWith('SEARCH_')) return 'SearchBookTitleError';
	if (!body.success) return 'SearchBookError';
	return body.data?.items?.[0] ?? 'SearchBookTitleError';
};

/** `20140519` or `2014-05-19T00:00:00` → `2014-05-19`; anything else is passed through. */
export const normalizeDate = (date: string): string => {
	const m = /^(\d{4})-?(\d{2})-?(\d{2})/.exec(date ?? '');
	return m ? `${m[1]}-${m[2]}-${m[3]}` : date;
};
