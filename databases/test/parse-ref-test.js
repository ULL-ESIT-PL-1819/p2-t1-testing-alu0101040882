const parseRDF = require('../lib/parse-rdf.js');

'use strict';

const fs = require('fs');
const expect = require('chai').expect;

const rdf = fs.readFileSync(`${__dirname}/pg132.rdf`);

describe('parseRDF' , () => {
	it('should be a function', () => {
		expect(parseRDF).to.be.a('function');
	});

	it('should parse RDF content' , () => {
		const book = parseRDF(rdf);
		expect(book).to.be.an('Object');
		expect(book).to.have.a.property('id',132);
		expect(book).to.have.a.property('title','The Art of War');


		expect(book).to.have.a.property('authors')
        	.that.is.an('array').with.lengthOf(2)
    	   	.and.contains({ "name": "Sunzi, active 6th century B.C.",
      		"webpages": ["http://en.wikipedia.org/wiki/Sun_Tzu", 
		"http://zh.wikipedia.org/wiki/%E5%AD%99%E6%AD%A6"]})
        	.and.contains({ "name": "Giles, Lionel",
      		"webpages": ["http://en.wikipedia.org/wiki/Lionel_Giles"] });

		expect(book).to.have.a.property('subjects')
		.that.is.an('array').with.lengthOf(2)
		.and.contains('Military art and science -- Early works to 1800')
		.and.contains('War -- Early works to 1800');

		expect(book).to.have.property('lcc')
		.that.is.a('string').with.a.lengthOf(1)
		.and.match(/^[^IOWXY]/);

		expect(book).to.have.a.property('sources')
		.that.is.an('array').with.lengthOf(10)
	});
});
