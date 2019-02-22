# Transforming Data and Testing Continuously

**Travis:** [![Build Status](https://travis-ci.org/ULL-ESIT-PL-1819/p2-t1-testing-alu0101040882.svg?branch=master)](https://travis-ci.org/ULL-ESIT-PL-1819/p2-t1-testing-alu0101040882)



*.travis.yml*

    language: node_js
	node_js:
	  - "10"
	npm:
	 - "6.5.0"

	before_install:
	  - cd databases

**Tutorial:**
Esta práctica consiste en la extracción de datos de ficheros .rdf y la realización de pruebas para dichas extracciones.

Para la realización de la misma en primer lugar es necesario crear los directorios donde trabajaremos.

    $ mkdir data
    $ mkdir databases

Seguidamente tenemos que descargar los datos con los que vamos a trabajar ( ficheros .rdf pertenecientes al proyecto Gutemberg). Para ello podemos ejecutar los siguientes comandos.


    $ cd data
	$ curl -O http://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2
	$ tar -xvjf rdf-files.tar.bz2


También podemos automatizar este proceso mediante la creacion de un gulpfile como el siguiente:

    /* Este gulpfile solo es válido para la version 3.9.1*/
    var gulp = require('gulp');
	var shell = require('gulp-shell');
	gulp.task("c5-get-guttenberg", shell.task(
	    'cd transforming-data-and-testing-continuously-chapter-5/data && ' +
	    'curl -O https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2 &&' +
	    'tar -xvjf rdf-files.tar.bz2'
	));
El desarrollo basado en pruebas lo realizaremos usando las librerías **mocha** y  **chai** puesto que estas definen unas "afirmaciones" mucho mas legibles para un humano que las que tiene node por defecto. Para instalar estas librerías bastará con realizar: 

    $ cd databases
	$ npm init -y
	$ npm install --save-dev --save-exact mocha@2.4.5 chai@3.5.0
una vez realizado esto se nos creará el fichero package.json que contendrá las dependencias y configuraciones del proyecto. Para poder realizar los test será necesario añadir:

    "scripts": {
	"test": "mocha"
	}
Ahora ya podemos crear los test. Para ello debemos de crear la carpeta *test* , que contenga el fichero .rdf al que realizaremos las pruebas (en este caso el pg132.rdf) y un fichero *parse-rdf-test.js* que contenga el test a realizar:

	    'use strict';
	const fs = require('fs');
	const expect = require('chai').expect;
	const rdf = fs.readFileSync(`${__dirname}/pg132.rdf`);
	describe('parseRDF', () => {
		it('should be a function', () => {
			expect(parseRDF).to.be.a('function');
		});
	});
Al ejecutar este test con **npm test** obviamente fallará, puesto que esta esperando que exista un función *parseRDF* que todavía no hemos definido. Por lo tanto la siguiente tarea a realizar es la escritura de esa función en el fichero */lib/parse-rdf-test.js*

    'use strict';
	module.exports = rdf => {
	};
además será necesario añadir la siguiente linea al test para que sepa donde esta parseRDF:

    const parseRDF = require('../lib/parse-rdf.js');
Una vez realizado esto nuestros test pasaran sin problemas.
Para no tener que estar poniendo ***npm test*** constantemente podemos añadir otro script al package.json que se encargue de ejecutar los test cuando se modifiquen los archivos.

    "scripts": {
	"test": "mocha",
	"test:watch": "mocha --watch --reporter min"
	}
esto lo podemos ejecutar mediante el comando ***"npm run test:watch"***

Para extraer datos desde los fichero .rdf usaremos Cheerio , un modulo de node que permite moverse fácilmente a través de fichero xml o html. Instalaremos cheerio mediante el siguiente comando:

    $ npm install --save --save-exact cheerio@0.22.0

Ahora podemos continuar creando test y luego el código que hace que estos test se cumplan.
Añadimos el siguiente test en *databases/test/parse-rdf-test.js*

	it('should parse RDF content', () => {
	const book = parseRDF(rdf);
	expect(book).to.be.an('object');
	expect(book).to.have.a.property('id', 132);
	});
Este test espera que book sea un objeto con la propiedad id, que tiene un valor de 132.
Para hacer que se cumpla este código podemos añadir esto en el fichero parse-rdf.js:

    'use strict';
	const cheerio = require('cheerio');
	module.exports = rdf => {
	const $ = cheerio.load(rdf);
	const book = {};
	book.id = +$('pgterms\\:ebook').attr('rdf:about').replace('ebooks/', '');
	return book;
	};
Este código hace uso de la herramienta cheerio para navegar a través del xml y encontrar el valor del id del libro. 
Ahora podemos comprobar que los test pasan correctamente.

Es facil darnos cuenta que la metodología de desarrollo hasta el momento ha sido:

 1. Creación de unas pruebas
 2. Comprobar que dichas pruebas fallan
 3. Crear el código que hace que estas pruebas se cumplan
 4. Comprobar que las pruebas pasan

Siguiendo esta metodología y haciendo uso del modulo cheerio podemos obtener más atributos para nuestro libro y así enriquecer nuestro programa. Por lo tanto hemos de crear unas pruebas para los atributos deseados, asi que nuestro fichero de pruebas puede ser algo como el siguiente:

    const parseRDF = require('../lib/parse-rdf.js');
	
	'use strict';

	const fs = require('fs');
	const expect = require('chai').expect;

	const rdf = fs.readFileSync('test/pg132.rdf');

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


y el código necesario para pasar las pruebas el siguiente:

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
Mediante estos dos fichero extraemos los atributos de id, autores, temas, lcc y fuentes del fichero .rdf y comprobamos que el contenido de los mismos sea el esperado.

**Capturas del funcionamiento:**

Test:


![enter image description here](https://lh3.googleusercontent.com/7NpBcbUcXBu9cvi_p2W7mj9IiTP3dDPpLXp3DpV-n76O2OkD4Pz52MNBKBT038AEPSjQmSTaAKg)


rdf-to-json.js


![enter image description here](https://lh3.googleusercontent.com/6nAMWvoKr9zX5mjIrtKSCz5FqPLTRNWSRJGkB0VyAP3S6hNvelXeuBPpzK6uPMAfSSyUpsWjUXk)![enter image description here](https://lh3.googleusercontent.com/Ul4SiG36ER9MQfhFvvpm4xILibflD5ybndQv5fzcxwS7auHvB_MlajUE8XzgEyZfqb1AHaYZK_8)

Travis:


![enter image description here](https://lh3.googleusercontent.com/cjvNFpqoy7UruH1qfe3QrirImogBdm8RVTbhkFGoGhtrKbErXNiRWhPQTR-elvYFm8ORMzvV7Mc)
