# RS_WCL
Roquefort Softwares' Web Components Library

# But de cette librairie
La tendance actuelle dans le web, consiste à utiliser des frameworks afin d'accélérer le développement tout en uniformisant les méthodes de travail.

Cependant, l'utilisation de frameworks a fini, à la longue, par amener deux effets de bords :

* **perte de performances** dû à l'ajout de couches supplémentaires souvent très lourdes
* **inovation difficile** dû aux limitations inhérentes au cadre imposé par un framework

Le but de cette librairie est d'apporter les indispensables à l'application du design pattern **MVC** dans le développement frontend (dont le **live binding**), sans adjonction de ces effets de bord.

En effet, les standards ont suffisamment évolué et depuis suffisamment longtemps pour permettre de développer soi-même sa librairie de composants, sans que cette pratique ne soit réellement chronophage. De plus, travailler de la sorte permet de maîtriser son code de bout en bout, et donc de le faire évoluer au gré de ses besoins, sans devoir attendre une hypothétique mise à jour du framework.

Les standards **EcmaScript 6 (2015)** permettent la création de composants web from scratch. La RS WCL définit des fonctions permettant d'appliquer le **live binding** sur les composants web ainsi créés.

De cette manière, et sans avoir à utiliser de framework, mettre en place une interface en s'appuyant sur MVC devient parfaitement naturel :

* **Modèle** : Cet aspect étant principalement géré en backend, nul besoin de s'en préoccuper ici. On en retrouve toutefois des traces au niveau des controllers. Par défaut, la RS WCL traduit les références à **scope** par **document.currentController.scope**. Aussi, est-il recommandé (mais pas indispensable), de créer un objet **scope** embarquant les données du modèle correspondant, dans chacune de vos classes controller, et de faire en sorte que **document.currentController** référence à tout moment le controller actif.
* **Vue** : Les composants web de cette librairie sont utilisables sous forme de balises HTML. Cette couche prend donc la forme de pages web ou de templates HTML.
* **Controller** : Le live binding intégré aux composant vous permettra de mettre à jour votre interface en ne modifiant que des objets javascript. En principe, vos controllers ne devraient pas avoir besoin d'accéder au DOM. Dans le cas contraire, il est préférable d'implémenter un nouveau composant.

# Fichiers
Il est recommandé de stocker les fichiers CSS dédiés aux différents composants dans un dossier à part.

**Important :**
Il vous faudra initialiser la constante **COMPONENTS_CSS_PATH** ('js/rs_wcl.js' -> ligne 10) pour que les composants puissent accéder à leurs feuilles de styles respectives.

# La bibliothèque de fonctions
La bibliothèque de fonctions est stockée au sein de 2 fichiers distincts :

* **main.js** contient des fonctions utilitaires (routage, fonction d'appel AjaX, conversion de fichiers en base64 pour les images, par exemple)
* **RS_WCL.js** contient une classe contenant un ensemble de fonctions statiques, prévues pour être utilisées au sein des composants. On y trouve nottamment les fonctions liées au live binding ainsi que la fonction permettant d'accéder à un objet, une propriété d'objet, ou encore un élément de liste, à partir de l'expression littérale correspondante (indispensable au fonctionnement du live binding). En outre, ce script définit également la classe **HTMLBaseElement** héritant de **HTMLElement** et définissant un hook supplémentaire, appelé lorsque la balise **ainsi que son contenu** est chargée par le navigateur, ce qui peut s'avérer indispensable pour le développement de certains composants.

# Les composants
Pour des raisons de maintenabilité (entre autres), j'ai stocké le code des composants dans des fichiers séparés. Si le code CSS doit rester séparé afin d'éviter d'alourdir le shadow DOM des composants, le code javascript peut (et devrait, en production, afin de réduire le temps de chargement initial) être regroupé au sein d'un seul et même fichier (minifié, idéalement). Pour ce faire, il vous suffira de prendre en compte cet aspect dans votre script de déploiement. En effet, la boucle **for** des langages de script système étant conçue pour les parcours de fichiers, il est aisé d'automatiser ce processus.

La plupart des composants de cette bibliothèque sont prévus pour pouvoir être utilisés aussi bien en tant que balises HTML qu'en tant que classe javascript héritant de **HTMLElement**. Pour rendre ceci possible, l'implémentation a été séparée en deux classes distinctes :

* La classe prévue pour un usage purement javascript définit la structure HTML/CSS ainsi que le comportement du composant. Elle définit un constructeur prenant en charge tous les paramètres nécessaires à sa création. Certains de ces paramètres sont optionnels (précisé en commentaire de la classe). Le composant est donc créé via l'opérateur **new** et peut ensuite être injecté au sein du DOM. **Utiliser le composant de cette manière ne l'encapsule pas dans un shadow DOM. Par conséquent, son rendu peut s'en trouver perturbé par le CSS utilisé par le reste de la page. De plus, cela vous imposera d'inclure le CSS du composant à la page au sein de laquelle il sera injecté.**
* La classe prévue pour une utilisation en tant que balise HTML crée un shadow DOM au sein duquel sont encapsulés le CSS du composant ainsi que l'objet issu de l'appel au constructeur de la classe purement javascript. Les paramètres passés au constructeur sont obtenus à partir des attributs définis par la balise HTML. En termes d'implémentation, le plus souvent, cette classe est uniquement chargée du traitement des attributs de la balise (et aussi parfois, de son contenu), ainsi que de la création du shadow DOM.
