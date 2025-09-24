import { getLocaleMessage } from './localeService';
import { normalizePath, Notice, requestUrl, moment } from 'obsidian';
import type { BookMetadata, CustomField, ToggleField } from '../main';
import type { FileManager, TFile } from 'obsidian';

interface BookResponseData {
	item: BookMetadata[];
}

const itemSearchUrl = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
const itemLookupUrl = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx';

const baseParams = {
	Output: 'JS',
	Version: '20131101',
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

export const searchBook = async (title: string, ttbKey: string) => {
	try {
		const params = new URLSearchParams({
			ttbkey: ttbKey,
			Query: title,
			QueryType: 'Keyword',
			MaxResults: '1',
			...baseParams,
		});
		const searchUrl = `${itemSearchUrl}?${params.toString()}`;

		const response = await requestUrl({ url: searchUrl });
		const data = response.json as BookResponseData;

		if (data.item.length === 0) {
			new Notice(getLocaleMessage('SearchBookTitleError'));
			return null;
		}

		return data.item[0].isbn13;
	} catch {
		new Notice(getLocaleMessage('SearchBookError'));
		return null;
	}
};

export const getBookInfo = async (isbn: string, ttbKey: string) => {
	try {
		const params = new URLSearchParams({
			ttbkey: ttbKey,
			ItemId: isbn,
			...baseParams,
		});
		const lookupUrl = `${itemLookupUrl}?${params.toString()}`;

		const response = await requestUrl({ url: lookupUrl });
		const data = response.json as BookResponseData;

		if (data.item.length === 0) {
			new Notice(getLocaleMessage('SearchBookTitleError'));
			return null;
		}

		return data;
	} catch {
		new Notice(getLocaleMessage('SearchBookFetchingError'));
		return null;
	}
};

interface MyFrontmatter {
	tags: string[];
	title: string;
	subTitle?: string;
	author: string;
	publisher: string;
	pages: number;
	pubDate: string;
	isbn: string;
	cover: string;
	category: string;
	[key: string]: string | number | boolean | string[] | undefined | null;
}

export const buildUpdatedFrontmatterContent = async (
	fileManager: FileManager,
	file: TFile,
	bookInfo: BookMetadata,
	custom: CustomField[],
	toggleFields: ToggleField[],
	shouldSplitSubTitle: boolean,
	shouldHighQualityCover: boolean,
	path: string,
) => {
	try {
		const [mainTitle, subTitle] = bookInfo.title.split('-');
		const tags = bookInfo.categoryName.split('>').map(tag => tag.trim().replace(/\s/g, ''));
		await fileManager.processFrontMatter(file, (frontmatter: MyFrontmatter) => {
			frontmatter.tags = tags ?? [];
			if (shouldSplitSubTitle && bookInfo.title.split('-').length > 1) {
				frontmatter.title = mainTitle.trim();
				frontmatter.subTitle = subTitle.trim();
			} else {
				frontmatter.title = bookInfo.title;
			}
			frontmatter.author = bookInfo.author;
			frontmatter.publisher = bookInfo.publisher;
			frontmatter.pages = bookInfo.subInfo.itemPage;
			frontmatter.pubDate = bookInfo.pubDate;
			frontmatter.isbn = bookInfo.isbn13;
			frontmatter.cover = shouldHighQualityCover ? setHighQualityCover(bookInfo.cover) : bookInfo.cover;
			frontmatter.category = tags[1] ?? '';
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
		const safeTitle = shouldSplitSubTitle ? setSafeTitle(mainTitle.trim()) : setSafeTitle(bookInfo.title);
		return normalizePath(`${folderPath}/${safeTitle}.md`);
	} catch {
		new Notice(getLocaleMessage('updateFrontmatterError'));
	}
};

const setSafeTitle = (title: string): string => {
	return title.replace(/[/:*?"<>|]/g, '_');
};

const setHighQualityCover = (cover: string): string => {
	let highQualityUrl = cover.replace(/coversum/i, 'letslook');
	highQualityUrl = highQualityUrl.replace(/_\d\.jpg$/, '_f.jpg');
	return highQualityUrl;
};
