import {FileManager, normalizePath, Notice, requestUrl, stringifyYaml, TFile} from "obsidian";
import {BookMetadata, CustomField, ToggleField} from "../main";

interface BookResponseData {
	item: BookMetadata[];
}

const itemSearchUrl = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
const itemLookupUrl = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx';

const baseParams = {
	Output: 'JS',
	Version: '20131101',
}

export const escapeHtml = (str: string): string => {
	return str.replace(/[&<>"']/g, (m) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	}[m]!));
}

export const searchBook = async (title: string, ttbKey: string) => {
	const params = new URLSearchParams({
		ttbkey: ttbKey,
		Query: title,
		QueryType: 'Title',
		MaxResults: '1',
		...baseParams,
	});
	const searchUrl = `${itemSearchUrl}?${params.toString()}`;

	const response = await requestUrl({ url: searchUrl });
	const data: BookResponseData = response.json;

	if (data.item.length === 0) {
		new Notice('❌ Cannot find book with the given title');
	}

	return data.item[0].isbn13 ;
}

export const getBookInfo = async (isbn: string, ttbKey: string) => {
	const params = new URLSearchParams({
		ttbkey: ttbKey,
		ItemId: isbn,
		...baseParams,
	});
	const lookupUrl = `${itemLookupUrl}?${params.toString()}`;

	const response = await requestUrl({ url: lookupUrl });
	const data: BookResponseData = response.json;

	return data;
}

export const buildUpdatedFrontmatterContent =  async (fileManager: FileManager,file: TFile, bookInfo: BookMetadata, custom: CustomField[], toggleFields: ToggleField[], path: string) => {
	try {
		await fileManager.processFrontMatter(file,(frontmatter) => {
			frontmatter['tags'] = bookInfo.categoryName.split('>') ?? [];
			frontmatter['title'] = bookInfo.title;
			frontmatter['author'] = bookInfo.author;
			frontmatter['publisher'] = bookInfo.publisher;
			frontmatter['pubDate'] = bookInfo.pubDate;
			frontmatter['isbn'] = bookInfo.isbn13;
			frontmatter['cover'] = bookInfo.cover;
			frontmatter['category'] = bookInfo.categoryName.split(">")[1] ?? '';
			toggleFields.forEach((toggle) => {
				if (toggle.enabled && toggle.key.trim()) {
					if (toggle.key === 'startReadDate' || toggle.key === 'finishReadDate') {
						frontmatter[toggle.key.trim()] = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
					} else {
						frontmatter[toggle.key.trim()] = toggle.value;
					}
				}
			})
			custom.forEach((item) => {
				if (item.key.trim()) {
					frontmatter[item.key.trim()] = item.value;
				}
			})
		});
		const folderPath = path.substring(0, path.lastIndexOf("/"));
		const safeTitle = bookInfo.title.replace(/[\/:*?"<>|]/g, "_");
		const newPath = normalizePath(`${folderPath}/${safeTitle}.md`);

		return newPath;
	} catch (error) {
		new Notice('❌ Error processing frontmatter');
	}
}
