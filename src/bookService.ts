import { getLocaleMessage } from './localeService';
import { normalizePath, Notice, requestUrl, moment } from 'obsidian';
import type { CustomField, ToggleField } from '../main';
import { firstItem, normalizeDate, type BookMetadata, type Yes24Response } from './yes24';
import type { FileManager, TFile } from 'obsidian';

const apiBase = 'https://apis.yes24.com/v1/goods';

// Calls a YES24 endpoint and returns the first item, or null after showing a Notice.
const fetchFirstItem = async (endpoint: string, params: Record<string, string>, apiKey: string) => {
	const response = await requestUrl({
		url: `${apiBase}/${endpoint}?${new URLSearchParams(params).toString()}`,
		headers: { 'X-Api-Key': apiKey },
		throw: false, // YES24 reports errors in the JSON body (errorCode)
	});
	const result = firstItem(response.json as Yes24Response);
	if (typeof result === 'string') {
		new Notice(getLocaleMessage(result));
		return null;
	}
	return result;
};

export const escapeHtml = (str: string): string => {
	return str.replace(
		/[&<>"']/g,
		m =>
			({
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
			})[m]!,
	);
};

export const searchBook = async (title: string, apiKey: string) => {
	try {
		const item = await fetchFirstItem('itemList', { query: title, category: 'BOOK', pageSize: '1' }, apiKey);
		return item?.itemId ?? null;
	} catch {
		new Notice(getLocaleMessage('SearchBookError'));
		return null;
	}
};

// ponytail: two calls per book (search, then detail). itemList with detail=Y may already
// return every field; collapse to one call once that is confirmed against a live response.
export const getBookInfo = async (itemId: number, apiKey: string) => {
	try {
		return await fetchFirstItem('itemDetail', { searchType: 'ItemId', query: String(itemId), detail: 'Y' }, apiKey);
	} catch {
		new Notice(getLocaleMessage('SearchBookFetchingError'));
		return null;
	}
};

interface MyFrontmatter {
	title: string;
	subTitle?: string;
	author: string;
	publisher: string;
	pages?: number;
	pubDate: string;
	isbn: string;
	cover: string;
	link: string;
	[key: string]: string | number | boolean | string[] | undefined | null;
}

export const buildUpdatedFrontmatterContent = async (
	fileManager: FileManager,
	file: TFile,
	bookInfo: BookMetadata,
	custom: CustomField[],
	toggleFields: ToggleField[],
	shouldSplitSubTitle: boolean,
	path: string,
) => {
	try {
		await fileManager.processFrontMatter(file, (frontmatter: MyFrontmatter) => {
			frontmatter.title = bookInfo.title;
			if (shouldSplitSubTitle && bookInfo.subTitle) frontmatter.subTitle = bookInfo.subTitle;
			frontmatter.author = bookInfo.author;
			frontmatter.publisher = bookInfo.publisher;
			if (bookInfo.pages) frontmatter.pages = bookInfo.pages;
			frontmatter.pubDate = normalizeDate(bookInfo.publishDate);
			frontmatter.isbn = bookInfo.isbn13;
			frontmatter.cover = bookInfo.cover;
			// YES24 API terms require a link back to the product page.
			frontmatter.link = bookInfo.link;
			toggleFields.forEach(toggle => {
				if (toggle.enabled && toggle.key.trim()) {
					if (toggle.key === 'startReadDate' || toggle.key === 'finishReadDate') {
						frontmatter[toggle.key.trim()] = moment().format('YYYY-MM-DD');
					} else {
						frontmatter[toggle.key.trim()] = toggle.value;
					}
				}
			});
			custom.forEach(item => {
				if (item.key.trim()) {
					frontmatter[item.key.trim()] = item.value;
				}
			});
		});
		const folderPath = path.substring(0, path.lastIndexOf('/'));
		const safeTitle = setSafeTitle(bookInfo.title);
		return normalizePath(`${folderPath}/${safeTitle}.md`);
	} catch {
		new Notice(getLocaleMessage('updateFrontmatterError'));
	}
};

const setSafeTitle = (title: string): string => {
	return title.replace(/[/:*?"<>|]/g, '_');
};

