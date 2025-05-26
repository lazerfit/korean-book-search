import {App, Notice, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';
import { searchBook, getBookInfo, buildUpdatedFrontmatterContent } from "./src/bookService";

export interface BookMetadata {
	title: string;
	author: string;
	pubDate: string;
	isbn13: string;
	cover: string;
	categoryName: string;
	publisher: string;
}

export interface CustomField {
	key: string;
	value: string;
}

export interface ToggleField {
	key: string;
	value: string | number;
	enabled: boolean;
}

interface KoreanBookSearchSettings {
	API_KEY: string;
	customFields: CustomField[];
	defaultFrontmatterFields: ToggleField[];
}

const DEFAULT_SETTINGS: KoreanBookSearchSettings = {
	API_KEY: '',
	customFields: [],
	defaultFrontmatterFields: [
		{key: 'myRate', value: 0, enabled: true},
		{key: 'status', value: '읽는 중', enabled: true},
		{key: 'startReadDate', value: new Date().toISOString().split("T")[0], enabled: true},
		{key: 'finishReadDate', value: new Date().toISOString().split("T")[0], enabled: false},
	],
}

export default class KoreanBookSearchPlugin extends Plugin {
	settings: KoreanBookSearchSettings;

	async setFrontmatterDataToFile(file: TFile, bookInfo: BookMetadata) {
		const text = await this.app.vault.read(file);
		const {	newContent, newPath } = buildUpdatedFrontmatterContent(text, bookInfo, this.settings.customFields, this.settings.defaultFrontmatterFields, file.path);

		try {
			await this.app.vault.modify(file, newContent);
			await this.app.vault.rename(file, newPath);
			new Notice('✅ 책 정보가 업데이트 되었습니다.');
		} catch {
			new Notice('❌ 책 정보 업데이트 중 오류 발생');
		}

	}

	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon('book-open', '책 정보 자동 입력', (evt: MouseEvent) => {
			const file = this.app.workspace.getActiveFile();
			const API_KEY = this.settings.API_KEY;
			if (!API_KEY) {
				new Notice('❌ API Key가 설정되지 않았습니다.');
				return;
			}
			if (file && file.extension === 'md') {
				const rawTitle = file.basename;
				const cleanTitle = rawTitle.replace(/\(.*\)/gi, "").replace(/\[.*]/gi, "").replace(":", "\uFF1A").replace("?", "\uFF1F").trim();
				const custom: Record<string, string> = {};
				const seen = new Set<string>();
				this.settings.customFields.forEach(f => {
					if (!seen.has(f.key.trim())) {
						custom[f.key.trim()] = f.value;
						seen.add(f.key.trim());
					}
				});
				searchBook(cleanTitle, API_KEY)
					.then(isbn => {
						return getBookInfo(isbn, API_KEY)
					})
					.then(data => {
						const bookInfo = data.item[0];
						new Notice('✍️ 책 정보 업데이트 중입니다...');
						this.setFrontmatterDataToFile(file, bookInfo);
					})
					.catch(() => {
						new Notice('❌ 책 정보 처리 중 오류 발생');
				})
			}
		});

		ribbonIconEl.addClass('korean-book-search-ribbon-class');

		this.addSettingTab(new KoreanBookSearchSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		const loaded = await this.loadData();
		this.settings = {
			...DEFAULT_SETTINGS,
			...loaded,
			defaultFrontmatterFields: loaded?.defaultFrontmatterFields ?? DEFAULT_SETTINGS.defaultFrontmatterFields,
			customFields: loaded?.customFields ?? DEFAULT_SETTINGS.customFields,
		};
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

let apiKeyInput = '';

class KoreanBookSearchSettingTab extends PluginSettingTab {
	plugin: KoreanBookSearchPlugin;

	constructor(app: App, plugin: KoreanBookSearchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: '🚀API KEY 설정 (Aladin API Key Setup)'});
		new Setting(containerEl)
			.setName('API_KEY')
			.setDesc('aladin API Key를 입력하세요 (Enter your Aladin API key)')
			.addText(text =>{
				text.inputEl.type = 'password';
				text.setPlaceholder('ttbkey...')
				.setValue(this.plugin.settings.API_KEY)
				.onChange(async (value) => {
					apiKeyInput = value;
				})})
			.addButton(btn =>
				btn
					.setButtonText('save')
					.setCta()
					.onClick(async () => {
						this.plugin.settings.API_KEY = apiKeyInput;
						await this.plugin.saveSettings()
							.then(() => new Notice('✅ API Key가 저장되었습니다'));
					})
			);
		containerEl.createEl('h2', {text: '🧩 기본 필드 토글 (Default Frontmatter Fields)'});
		this.plugin.settings.defaultFrontmatterFields.forEach((f, index) => {
			new Setting(containerEl)
				.setName(`${f.key} 필드 포함 여부 (Include '${f.key}')`)
				.setDesc(`${f.key} 필드를 프론트매터에 포함할지 선택 (Toggle whether to include '${f.key}' in frontmatter)`)
				.addToggle(t => {
					t.setValue(f.enabled)
						.onChange(async (value) => {
							this.plugin.settings.defaultFrontmatterFields[index].enabled = value;
							await this.plugin.saveSettings();
						})
				})
		})
		containerEl.createEl('h2', { text: '📋 커스텀 프론트매터 필드 목록 (Custom Frontmatter Fields)' });

		this.plugin.settings.customFields.forEach((f, index) => {
			new Setting(containerEl)
				.setName(`필드 ${index + 1}`)
				.addText(text => text
					.setPlaceholder('key')
					.setValue(f.key)
					.onChange(async (value) => {
						this.plugin.settings.customFields[index].key = value;
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder('value')
					.setValue(f.value)
					.onChange(async (value) => {
						this.plugin.settings.customFields[index].value = value;
						await this.plugin.saveSettings();
					}))
				.addExtraButton(button => {
					button.setIcon('trash')
						.setTooltip('필드 삭제 (Remove field)')
						.onClick(async () => {
							this.plugin.settings.customFields.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						});
				});
		});
		new Setting(containerEl)
			.addButton(button => {
				button.setButtonText('➕ Add')
					.onClick(async () => {
						this.plugin.settings.customFields.push({ key: '', value: '' });
						await this.plugin.saveSettings();
						this.display();
					});
			});
	}
}
