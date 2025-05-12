import {requestUrl, stringifyYaml, TFile, Notice, normalizePath} from "obsidian";

const itemSearchUrl = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
const itemLookupUrl = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx';

const baseParams = {
	Output: 'JS',
	Version: '20131101',
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
	const data = response.json;
	const isbn = data.item[0].isbn13;

	return isbn;
}

export const getBookInfo = async(isbn: string, ttbKey: string) => {
	const params = new URLSearchParams({
		ttbkey: ttbKey,
		ItemId: isbn,
		...baseParams,
	});
	const lookupUrl = `${itemLookupUrl}?${params.toString()}`;

	const response = await requestUrl({ url: lookupUrl });
	const data = response.json;

	return data;
}

export const updateFrontmatter = async (file: TFile, bookInfo: Record<string, any>, custom: Record<string, any> = {}, toggleFields: Record<string, any>[]) => {
	const fronmatterData = formatFrontmatterData(bookInfo, custom, toggleFields);
	const yaml = stringifyYaml(fronmatterData);
	const fullYaml = `---\n${yaml}---\n`;

	const content = await file.vault.adapter.read(file.path);
	const hasFrontmatter = /^---\n[\s\S]*?\n---/.test(content);
	const newContent = hasFrontmatter
		? content.replace(/^---\n[\s\S]*?\n---/, fullYaml)
		: fullYaml + content;

	await file.vault.adapter.write(file.path, newContent);

	const folderPath = file.path.substring(0, file.path.lastIndexOf("/"));
	const safeTitle = bookInfo.title.replace(/[\/:*?"<>|]/g, "_");
	const newPath = normalizePath(`${folderPath}/${safeTitle}.md`);
	await file.vault.adapter.rename(file.path, newPath)
		.then(() => {
			new Notice('✅ 책 정보가 업데이트 되었습니다.');
		})
		.catch((e) => {
			new Notice('❌ 책 정보 업데이트 중 오류 발생');
		});
}

const formatFrontmatterData = (raw: Record<string, any>, custom: Record<string, any>, toggleFields: Record<string, any>[]) => {
	const enabledToggleFields : Record<string, any> = {};
	toggleFields.forEach(f => {
		if (f.enabled && f.key.trim()) {
			enabledToggleFields[f.key.trim()] = f.value;
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
