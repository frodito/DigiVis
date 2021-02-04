# DigiVis

In this repository you can find the code developed for the project Digitization and Visualization of Archives and Collections, short DigiVis.

The project builds on new possibilities of the development of generic interfaces and the visual exploration of archives and collections and combines them with regard to a modular set of open source software for visual presentation and examination of archival documents. The development and application of the concepts, methods and tools takes place prototypically on the example of the radical constructivism and the Ernst von Glasersfeld Archive, on the other hand, the modular tool set can generally be used in memory institutions in the cultural field (GLAM).

The project was started and carried out by the Department of Media, Society and Communication from the University of Innsbruck.
More detailed descriptions about the project can be found at the webpage for the department [here](https://www.uibk.ac.at/medien-kommunikation/forschung/projekte/index.html.en), on the webpage of the project [here](https://dbis-digivis.uibk.ac.at/mediawiki/index.php/Project_Digivis) or at the [projects community page on zenodo](https://zenodo.org/communities/digivis/?page=1&size=20).

## Basic Setting 
[MediaWiki](https://www.mediawiki.org/wiki/MediaWiki) and the MW-extensions [Semantic MediaWiki](https://www.semantic-mediawiki.org/wiki/Semantic_MediaWiki) and [Semantic Text Annotator](https://www.mediawiki.org/wiki/Extension:Semantic_Text_Annotator) were used as a basis.
Using this setup, selected texts from the [estate of Ernst von Glasersfeld](https://www.evg-archive.net) were collected and saved as pages in [MediaWiki](https://www.mediawiki.org/wiki/MediaWiki).
Discourse analysis was applied on the selected texts and the corresponding sentences and paragraphs were annotated with the help of [Semantic Text Annotator](https://www.mediawiki.org/wiki/Extension:Semantic_Text_Annotator).
Annotated were argumentations, references, narrativs, and innovation discourses, and within argumentations, premises, examples, and conclusions were annotated.
Additionally, argumentations and innovation discourses were linked with the predominant topics found in the corpus.

## Structure
The content of this repository contains code developed for the project DigiVis and is split across the three folders `DigiVisMW-Extension`, `MediaWiki Forms adn Templates`, and `portalseite`. Their content is briefly described in the following.

### Folder `DigiVis-MW-Extension`
This folders contains some of the developed code, bundled in a custom MW-extension.
It includes a MediaWiki special page providing a searchable list of the annotations in MediaWiki, which can also be filtered by, e.g., topics or other attributes.
It also includes our API endpoint used to extract all annotations in JSON or CSV format, which was used as basis for a visualization.
The visualization was created in cooperation with [Jan Willem Tulp](http://tulpinteractive.com/), directly accessible [here](https://dbis-digivis.uibk.ac.at/portal/portal_evg_sub.html?lg=de&page=7).
Also included is a second special page, used to create and edit "Walks", which are individual stations build with annotations and connecting them together in a story you can walk through.

The code in this folder is generalized at the parts where customization is ment to happen, which should make it easier to adapt the code to your specific use case by refactoring generalized placeholder names with fitting names/descriptions.
More documentation can be found in [this document](https://dbis-digivis.uibk.ac.at/mediawiki/index.php/File:DigiVis_Technische_Umsetzung.pdf) <sup>[1](#footnote1)</sup>.

### Folder `MediaWiki forms and Templates`
One MW-extension used by [Semantic Text Annotator](https://www.mediawiki.org/wiki/Extension:Semantic_Text_Annotator) is [PageForms](https://www.mediawiki.org/wiki/Extension:Page_Forms).
This folder contains the content of the MW-pages of the forms and templates used in project.
The names and descriptions are also generalized, corresponding to the names in code found in the MW-extension folder. 


### folder `portalseite` 
To display the prototypical use case of the [Ernst von Glasersfeld Archive](https://www.evg-archive.net), the access to the outcomes of the project were bundled in a web page, which can be found [here](https://dbis-digivis.uibk.ac.at/portal/portal_evg.html).
This folder holds the code for that pages.
The code is not generalized but as it is deployed on the web server of the project.
Not included in this folder are two subfolders, one for [Font Awesome](https://fontawesome.com/) and a second with the use case specific media files.


<a name="footnote1">1<a>: Currently only available in German.