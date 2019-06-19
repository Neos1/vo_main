/*-------------------------------------------------------*/
import React from 'react';
import assert from 'assert';
import _ from 'lodash';

// COMPONENTS
import HashChange from '../../common/HashChange/HashChange';
//import translationStore from '../../../models/Translation/TranslationInstance';

/*-------------------------------------------------------*/
// Declarations

class HashTreeNode {
	_data = null;
	constructor() { }
	toString() {
		return this._data || '';
	}
	test() {
		return this._data !== null;
	}
}

/*class Locale extends HashTreeNode {
	static appropriteLanguages = translationStore.appropriteLanguages;
	constructor(lng) {
		assert(Locale.appropriteLanguages);
		super();
		if (_.includes(Locale.appropriteLanguages, lng)) {
			this._data = lng;
		}
	}
}
*/

class Meta extends HashTreeNode {
	constructor(_re, str) {
		super();
		assert(_re instanceof RegExp, `${_re} must be an instance of RegExp`);
		if (_.includes(str, '-')) {
			if (_re.test(str)) {
				let matched = str.match(_re);
				this._data = matched[2];
			}
		}
	}
}

class Login extends Meta {
	constructor(login) {
		const _re = /^([a-f]{3})-(\w{1,100})$/;
		super(_re, login);
	}
}

class Password extends Meta {
	constructor(password) {
		const _re = /^()(.{4}-[a-f0-9]{64})$/;
		super(_re, password);
	}
}

class Email extends Meta {
	constructor(email) {
		const _re = /^()(.{2}-[a-f0-9]{64})$/;
		super(_re, email);
	}
}

class HashTree {
	_locale = null;
	_meta = null;
	_rest = null;

	constructor(hash) {
		let components = _.tail(hash.split('/'));
		let fst = components[0];
		let snd = components[1];
		let fstRest = components.slice(1);
		let sndRest = components.slice(2);

		// TODO: refact duplicates

		let locale = new Locale(fst); // maybe Locale is first
		if (locale.test()) {
			this._locale = locale;

			this._rest = fstRest; // no Meta
			return;
		}

		let login = new Login(fst); // maybe Meta is first
		if (login.test()) {
			this._meta = login;
			this._rest = fstRest;
			return;
		}

		let password = new Password(fst); // maybe Meta comes after the locale
		if (password.test()) {
			this._meta = password;
			this._rest = fstRest;
			return;
		}

		let email = new Email(fst); // maybe Meta comes after the locale
		if (email.test()) {
			this._meta = email;
			this._rest = fstRest;
			return;
		}

		this._rest = components; // no Locale, no Meta
		return;
	}
/*
	localeUpdate(locale = '') {
		let theLocale = this._locale;
		if (theLocale.toString() !== locale)
			return theLocale.toString();
		else
			return null;
	}


	getLocale() { return this._locale; }
	getMeta() { return this._meta; }
	setLocale(locale) {
		assert(locale instanceof Locale, `${locale} must be instance of Locale`);
		this._locale = locale;
	}
*/
	deleteMeta() {
		this._meta = null;
	}

	toString() {
		let locale = this._locale;
		let meta = this._meta;
		let rest = this._rest;
		return [locale, meta, ...rest]
			.filter(x => x !== null)
			.reduce((l, r) => l + '/' + r.toString(), '#');
	}
}

/*-------------------------------------------------------*/
// Exports

export default class HashParser extends React.Component {
	//_translationStoreReference = translationStore;

	constructor() {
		super();
		this.handleHashChange({ hash: window.location.hash });
	}

	render() {
		return (<HashChange onChange={this.handleHashChange} />);
	}

	handleHashChange = ({ hash }) => {
		let hashUpdate = _.clone(hash);
		let originalTree = new HashTree(hash);
		let tree = _.clone(originalTree);
		//let locale = tree.getLocale();
		let meta = tree.getMeta();
		/*if (!locale) {
			const defaultLanguage = this.translationStoreReference.defaultLanguage;
			assert(defaultLanguage, `Default language = ${defaultLanguage}`)
			let locale = new Locale(defaultLanguage);
			assert(locale._data, `Locale data is ${locale._data}`);
			tree.setLocale(locale);
		}*/
		if (meta) {			
			tree.deleteMeta();
		}
	//	let currentLng = this.translationStoreReference.lng;
	//	let lngUpdate = tree.localeUpdate(currentLng);
		let treeUpdate = `${tree}` !== `${originalTree}`;
	/*	if (lngUpdate) {
			// this.updateBrowserURL(`${tree}`);
			this.translationStoreReference.changeLanguage(lngUpdate);
		}*/
		if (treeUpdate) {
			this.updateBrowserURL(`${tree}`);
		}
	}

	/*get translationStoreReference() {
		assert(this._translationStoreReference);
		return this._translationStoreReference;
	}*/

	updateBrowserURL(hashUpdate) {
		window.location.hash = hashUpdate;
	}
}
