'use strict';

const cheerio = require('cheerio');

module.exports = rdf => {

	const $ = cheerio.load(rdf);

	const book = {};

	book.id = +$('pgterms\\:ebook').attr('rdf:about').replace('ebooks/', ' ');

	book.title = $('dcterms\\:title').text();

	book.authors = $('pgterms\\:agent')
	.toArray().map(elem => {
		let author = {}

		author.name =  $(elem).find('pgterms\\:name').text();
		author.webpages = $(elem).find('pgterms\\:webpage')
		.toArray().map( x => $(x).attr('rdf:resource'));

		return author;
	});

	book.subjects = $('[rdf\\:resource$="/LCSH"]')
	.parent().find('rdf\\:value')
	.toArray().map(elem => $(elem).text());


	book.lcc = $('[rdf\\:resource$="/LCC"]')
	.parent().find('rdf\\:value').text();


	book.sources = $('pgterms\\:file')
	.toArray().map( elem =>  {

		let source = {};
		source.url = $(elem).attr('rdf:about');
		source.date = $(elem).find('dcterms\\:modified').text();
		source.desc = $(elem).find('rdf\\:Description').find('rdf\\:value').text();

		return source;
	});

	return book;

};
