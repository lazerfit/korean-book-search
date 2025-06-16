import {normalizePath, Notice, requestUrl, stringifyYaml} from "obsidian";
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

export const buildUpdatedFrontmatterContent =  (content: string, bookInfo: BookMetadata, custom: CustomField[], toggleFields: ToggleField[], path: string) => {
	const fronmatterData = formatFrontmatterData(bookInfo, custom, toggleFields);
	const yaml = stringifyYaml(fronmatterData);
	const fullYaml = `---\n${yaml}---\n`;

	const hasFrontmatter = /^---\n[\s\S]*?\n---/.test(content);
	const newContent = hasFrontmatter
		? content.replace(/^---\n[\s\S]*?\n---/, fullYaml)
		: fullYaml + content;

	const folderPath = path.substring(0, path.lastIndexOf("/"));
	const safeTitle = bookInfo.title.replace(/[\/:*?"<>|]/g, "_");
	const newPath = normalizePath(`${folderPath}/${safeTitle}.md`);

	return {
		newContent,
		newPath,
	}
}

const formatFrontmatterData = (raw: BookMetadata, custom: CustomField[], toggleFields: ToggleField[]) => {
	const enabledToggleFields : Record<string, string | number> = {};
	toggleFields.forEach(f => {
		if (f.enabled && f.key.trim()) {
			if (f.key === 'startReadDate' || f.key === 'finishReadDate') {
				enabledToggleFields[f.key.trim()] = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
			} else {
				enabledToggleFields[f.key.trim()] = f.value;
			}
		}
	});

	return {
		tags: raw.categoryName.split(">") ?? [],
		title: raw.title,
		author: raw.author,
		publisher: raw.publisher,
		pubDate: raw.pubDate,
		isbn: raw.isbn13,
		cover: raw.cover,
		category: raw.categoryName.split(">")[1] ?? '',
		...enabledToggleFields,
		...custom,
	}
}
