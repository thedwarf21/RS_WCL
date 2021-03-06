/*
  Copyright © 10/02/2020, Roquefort Softwares Web Components Library

  Permission is hereby granted, free of charge, to any person obtaining a copy of this Library and associated 
  documentation files (the “Software”), to deal in the Software without restriction, including without limitation 
  the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  The Software is provided “as is”, without warranty of any kind, express or implied, including but not limited to 
  the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the 
  authors or copyright holders Roquefort Softwares be liable for any claim, damages or other liability, whether in 
  an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or 
  other dealings in the Software.
  
  Except as contained in this notice, the name of the Roquefort Softwares Web Components Library shall not be used 
  in advertising or otherwise to promote the sale, use or other dealings in this Software without prior written 
  authorization from Roquefort Softwares.
*/

//---------------------------------------------------------------------------------------------------
//                                Composant Planning
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_Planning extends HTMLDivElement {

  /**************************************************************************************************
   * Génère une boîte de dialogue permettant de choisir une date et une heure de plannifcation      *
   **************************************************************************************************
   * @param | {string}  | rs_model    | Binding                                                     *
   **************************************************************************************************
   * @return              {DOMElement}              La boîte de dialogue                            *
   **************************************************************************************************/
  constructor(rs_model) {
    super();

    // Extraction des données du modèles objet
    this.rs_model = rs_model;
    let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
    let objModel = target_obj[property];
    this.data = objModel.data;
    this.empty_record = objModel.empty_record;
    
    // Génération de l'affichage initial puis binding de la liste "data" => display()
    this.display();
    RS_ArrayObserver(this.data, ()=> { this.display(); }, false);
  }

  /*******************************************************
   * Fonction générant l'affichage du composant planning *
   *******************************************************/
  display() {

  }
}
customElements.define('rs-wcl-planning', RS_Planning, { extends: 'div' });

/* Usage HTML uniquement */
class RSWCLPlanning extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    let rs_model = this.getAttribute("rs-model");
    RS_WCL.styleShadow(shadow, 'css/rs_planning.css');
    RS_WCL.styleShadow(shadow, 'css/theme.css');
    shadow.appendChild(new RS_Planning(rs_model));
  }
}
customElements.define('rs-planning', RSWCLPlanning);
