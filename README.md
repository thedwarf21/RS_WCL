# RS_WCL
Roquefort Softwares' Web Components Library

# But de cette librairie

La tendance actuelle dans le web, consiste à utiliser des frameworks afin d'accélérer le développement tout en uniformisant les méthodes de travail.

Cependant, l'utilisation de **frameworks** a fini, à la longue, par amener deux **effets de bords** :

* **perte de performances** dû à l'ajout de couches supplémentaires souvent très lourdes
* **impossibilité d'innover** dû aux limitations inhérentes au cadre imposé par un framework

Le but de cette librairie est d'apporter les indispensables à l'application du design pattern **MVC** dans le développement frontend sans adjonction de ces effets de bord.

En effet, les standards ont suffisamment évolué et depuis suffisamment longtemps pour permettre de développer soi-même sa librairie de composants, sans que cette pratique ne soit réellement chronophage. De plus, travailler de la sorte permet de maîtriser son code de bout en bout, et donc de le faire évoluer au gré de ses besoins, sans devoir attendre une hypothétique mise à jour du framework.

Les standards **EcmaScript 6 (2015)** permettent la création de composants web from scratch. Cette bibliothèque définit des fonctions permettant d'appliquer le **live binding** sur les composants web ainsi créer.

De cette manière, et sans besoin de framework, mettre en place une interface en s'appuyant sur MVC devient parfaitement naturel :

* **Modèle** : Cet aspect étant géré en backend, nul besoin de s'en préoccuper ici.
* **Vue** : Les composants web de cette librairie sont utilisables sous forme de balises HTML.
* **Controller** : Le live binding intégré aux composant vous permettra de mettre à jour votre interface en ne modifiant que des objets javascript.

Des améliorations sont évidemment nécessaires, cette bibliothèque étant en cours d'élaboration. Si je la partage aujourd'hui, c'est avant tout pour que les pratiques sur lesquelles elle s'appuie se démocratisent, de manière à optimiser au mieux vos créations web à venir.

# Fichiers

Telle qu'elle est actuellement écrite, les fichiers de la bibliothèque doivent être ventilés d'une manière précise afin qu'elle puisse fonctionner. Ce point pourrait êter aisément améliorer par la définition d'une constante pour le chemin du répertoire contenant les fichiers CSS.

* Les fichier CSS doivent être regroupés dans un répertoire nommé "css".
* Les fichiers JS doivent être regroupés dans un autre répertoire, situé au même niveau d'arborescence que le répertoire "css".

# La bibliothèque de fonctions

La bibliothèque de fonctions est stockée au sein de 2 fichiers distincts :

* **main.js** contient des fonctions utilitaires (routage, fonction d'appel AjaX, conversion de fichiers en base64 pour les images, par exemple)
* **RS_WCL.js** contient une classe contenant un ensemble de fonctions statiques, prévues pour être utilisées au sein des composants. On y trouve nottamment les fonctions liées au live binding ainsi que la fonction permettant d'accéder à un objet, une propriété d'objet, ou encore un élément de liste, à partir de l'expression littérale correspondante (indispensable au fonctionnement du live binding). En outre, ce script définit également une classe héritant de **HTMLElement** et définissant un hook supplémentaire, appelé lorsque la balise **ainsi que son contenu** est chargée par le navigateur, ce qui peut s'avérer indispensable pour le développement de certains composants.

# Les composants

Pour des raisons de maintenabilité, j'ai stocké le code des composants dans des fichiers séparés. Si le code CSS doit rester séparé afin d'éviter d'alourdir le shadow DOM des composants, le code javascript peut (et devrait, en production, afin de réduire le temps de chargement initial) être regroupé au sein d'un seul et même fichier. Pour ce faire, il vous suffira de prendre en compte cet aspect dans votre script de déploiement. 

Sous Linux, par exemple, il suffit de créer un fichier destiné à accueillir le script global. Une boucle **for** au sein de laquelle le **cat** du fichier courant est ajouté à la fin du fichier global, fera le travail.

La plupart des composants de cette bibliothèque sont prévus pour pouvoir être utilisés aussi bien en tant que balises HTML qu'en tant que classe javascript héritant de **HTMLElement**. Pour rendre ceci possible, l'implémentation a été séparée en deux classes distinctes :

* La classe prévue pour un usage purement javascript définit la structure ainsi que le comportement du composant. Elle définit un constructeur prenant en charge tous les paramètres nécessaires à la création du composant. Certains de ces paramètre sont optionnels (précisé en commentaire de la classe). **Utiliser le composant de cette manière ne l'encapsule pas dans un shadow DOM. Par conséquent, son rendu peut s'en trouver perturbé par le CSS utilisé par le reste de la page.**
* La classe prévue pour une utilisation en tant que balise HTML crée un shadow DOM au sein duquel sont encapsulés le CSS de base ainsi que l'objet issu de l'appel au constructeur de la classe prévue pour un usage purement javascript. Les paramètres passés au constructeur sont obtenus à partir des attributs définis par la balise HTML.
