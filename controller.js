/**
 * Controller de la page de documentation
 *
 * @class       MainController (name)
 * @description Ce controller à principalement vocation à gérer le routage interne lié au menu
 */
class MainController {

  /**
   * Constructeur : initialisation du scope pour génération du menu
   */
  constructor() {
    this.scope = {
      menu_items: [{
        lib: "<b>Télécharger la RS WCL</b>",
        onclick: ()=> { window.open("https://github.com/thedwarf21/RS_WCL/archive/refs/heads/main.zip"); }
      }, {
        lib: "<b>Découvrir la RS WCL</b>",
        children: [{
          lib: "<i>Présentation générale</i>",
          onclick: ()=> { routage("html_templates/presentation.html", this.routing_target); }
        }, {
          lib: "<i>Bonnes pratiques</i>",
          onclick: ()=> { routage("html_templates/bonnes_pratiques.html", this.routing_target); }
        }]
      }, {
        lib: "<b>Les composants</b>",
        children: [{
          lib: "<i>&lt;rs-banner-menu></rs-banner-menu&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-banner-menu.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-carousel></rs-carousel&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-carousel.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-cube></rs-cube&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-cube.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-cursor-input></rs-cursor-input&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-cursor-input.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-dialog></rs-dialog&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-dialog.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-file-input></rs-file-input&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-file-input.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-if></rs-if&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-if.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-input></rs-input&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-input.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-repeat></rs-repeat&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-repeat.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-select></rs-select&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-select.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-side-menu></rs-side-menu&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-side-menu.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-switch></rs-switch&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-switch.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-table></rs-table&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-table.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-textarea></rs-textarea&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-textarea.html", this.routing_target); }
        }, {
          lib: "<i>&lt;rs-tooltips></rs-tooltips&gt;</i>",
          onclick: ()=> { routage("html_templates/rs-tooltips.html", this.routing_target); }
        }]
      }],
      banner_menu: [{
        lib: "Sans enfants",
        onclick: ()=> { RS_Alert("<p>Vous avez cliqué sur l'élément de menu intitulé 'Sans enfants'</p>", "Clic sur menu 'Sans enfants'", "Fermer"); }
      }, {
        lib: "Avec enfants",
        children: [{
          lib: "Sous-menu 1",
          onclick: ()=> { RS_Alert("<p>Vous avez cliqué sur le sous-menu 1</p>", "Clic sur sous-menu", "Fermer"); }
        }, {
          lib: "Sous-menu 2",
          onclick: ()=> { RS_Alert("<p>Vous avez cliqué sur le sous-menu 2</p>", "Clic sur sous-menu", "Fermer"); }
        }, {
          lib: "Sous-menu 3",
          onclick: ()=> { RS_Alert("<p>Vous avez cliqué sur le sous-menu 3</p>", "Clic sur sous-menu", "Fermer"); }
        }]
      }],
      cursor_value: 5,
      image_base64: "",
      show_if_content: true,
      input_value: "",
      articles: [{
        nom: "Rame de 500 feuilles A4",
        options: [
          { detail: "80g/m²",   prix: 8.5 },
          { detail: "120g/m²",  prix: 15 },
          { detail: "160g/m²",  prix: 18.9 }
        ]
      }, {
        nom: "Stylos jetables",
        options: [
          { detail: "Unité",        prix: 2.5 },
          { detail: "Paquet de 10", prix: 12.5 },
          { detail: "Boîte de 100", prix: 85 }
        ]
      }],
      select_items: [
        { id: 1, designation: "Steak haché" }, 
        { id: 2, designation: "Tournedos Rossini" },
        { id: 3, designation: "Jambon de pays" },
        { id: 4, designation: "Magret fumé" },
        { id: 5, designation: "Jambon de poulet" },
        { id: 6, designation: "Chips aux crevettes" },
        { id: 7, designation: "Pommes de terre" },
        { id: 8, designation: "Haricots verts" },
        { id: 9, designation: "Carottes" }
      ],
      select_value: undefined,
      sw_square: true,
      sw_rounded: false,
      textarea_value: ""
    };
  }

  /**
   * Fonction dédiée à l'initialisation post chargement de la page :
   * 
   * L'élément div#milieu n'existe qu'une fois le DOM initialisé par le navigateur.
   * Afin que le routage fonctionne, il faut donc initialiser l'élément cible ici.
   */
  postLoadInit() { this.routing_target = document.getElementById("milieu"); }
}
