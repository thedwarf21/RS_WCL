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
//                Champs FILE personnalisé avec vignette de prévisualisation 
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_FileInput extends HTMLDivElement {

  /*************************************************************************
   * Génère un champ de formulaire de type FILE image                      *
   *************************************************************************
   * @param | {string} | id            | ID de l'input de type FILE        *
   * @param | {string} | base64        | Image au format Base64            *
   * @param | {string} | rs_model      | Binding                           *
   * @param | {string} | onImageChange | JS à exécuter dans loadImage()    *
   * @param | {number} | ratio         | Ratio exigé pour l'image          *
   * @param | {Array}  | classList     | Liste des classes CSS à appliquer *
   *************************************************************************/
  constructor(id, base64, rs_model, onImageChange, ratio, classList) {

    // On commence par générer une DIV container à laquelle on applique les classes en paramètre
    super();
    for (let className of classList)
      this.classList.add(className);

    // Photo
    let photo = document.createElement("IMG");
    photo.src = base64;
    photo.classList.add("rs-file-image");
    photo.setAttribute("onclick", "this.parentNode.getElementsByTagName('input')[0].click()");
    this.appendChild(photo);

    // Input file lié à la photo (ouvre sélection fichier sur un clic et affiche la photo)
    let inPhoto = document.createElement("INPUT");
    inPhoto.classList.add("rs-file-image");
    inPhoto.id = id;
    inPhoto.setAttribute("type", "file");
    this.appendChild(inPhoto);

    // Report du binding, du "onImageChange" et du "ratio" sur le wrapper (pour fonctionnement shadow DOM)
    if (rs_model)       RS_Binding.bindModel(rs_model, inPhoto, "src", "change", ()=> { this.loadImage(rs_model); });
    if (onImageChange)  this.setAttribute("onimagechange", onImageChange);
    if (ratio)          this.setAttribute("image-ratio", ratio);
  }

  /**********************************************************
   * Charge l'image sélectionnée via le champs FILE         *
   * Gère le hook ainsi que le ratio, s'ils sont paramétrés *
   **********************************************************/
  loadImage(rs_model) {
    let input_elt = this.getElementsByTagName("input")[0];
    getBase64(input_elt).then((base64) => {
      if (base64.substring(5, 10) === "image") {
        if (base64.length <= 25000) {
          this.getElementsByTagName("img")[0].src = base64;
          
          // Si on est en shadow DOM, il faut reporter la valeur de base64 sur l'hôte (propriété src)
          if (this.parentNode.host)
            this.parentNode.host.src = base64;

          // Si le binding a été paramétré, on l'applique (nécessaire en shadow DOM)
          if (rs_model) {
            let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
            target_obj[property] = base64;
          }

          // S'il y a un hook paramétrée, il faut l'exécuter
          let onImageChange = this.getAttribute("onimagechange");
          if (onImageChange) {

            // Si un ratio a été paramétré, on vérifie celui de l'image sélectionnée
            let ratio = this.getAttribute("image-ratio");
            if (ratio) {
              let i = new Image();
              i.onload = function() {
                if (i.width / i.height != ratio) {
                  //RS_WCL.showToastMessage("Format d'image incorrect.<br/>Ratio L/H attendu : " + ratio, MsgLevel.ERR, 3000);
                  RS_Alert("Format d'image incorrect<br/><br/>Ratio attendu (largeur/hauteur) : " + ratio, "Erreur", "Ok");
                } else eval(onImageChange);
              }
              i.src = base64;
            } else eval(onImageChange);
          }
        } else {
          //RS_WCL.showToastMessage("Les fichiers ne doivent pas dépasser les 20 ko", MsgLevel.ERR, 3000);
          RS_Alert("Les fichiers ne doivent pas dépasser les 20 ko", "Erreur", "Ok");
        }
      } else {
        //RS_WCL.showToastMessage("Seuls les fichiers image, sont autorisés", MsgLevel.ERR, 3000);
        RS_Alert("Seuls les fichiers image sont autorisés", "Erreur", "Ok");
      }
    });
  }
}
customElements.define('rs-wcl-file-input', RS_FileInput, { extends: 'div' });

/* Usage HTML uniquement */
class RSWCLFileInput extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    let idFile = this.getAttribute("id");
    let base64 = this.getAttribute("base64");
    let onimagechange = this.getAttribute("onimagechange");
    let ratio = this.getAttribute("ratio");
    let rs_model = this.getAttribute("rs-model");
    let classes = this.getAttribute("class");
    let classList = classes ? classes.split(" ") : [];
    RS_WCL.styleShadow(shadow, 'css/rs_file_input.css');
    RS_WCL.styleShadow(shadow, 'css/theme.css');
    shadow.appendChild(new RS_FileInput(idFile, base64, rs_model, onimagechange, ratio, classList));
  }
}
customElements.define('rs-file-input', RSWCLFileInput);
