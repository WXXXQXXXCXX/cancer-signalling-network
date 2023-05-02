
export const node_html = () =>{
  
  return [
    // {
    //     query: ".groupIcon",
    //     halign: "center",
    //     valign: "center",
    //     halignBox: "center",
    //     valignBox: "center",
    //     tpl: function (data: any) {

    //       return `<div class="element">
    //       <span class="element-label">M${data.id}</span>
    //       <span class="element-graphic">
    //         <span class="overlay"></span>
    //       </span>
          
    //     </div>`;
    //     }
    // },
    {
        query: ".nodeIcon",
        halign: "center",
        valign: "center",
        halignBox: "center",
        valignBox: "center",
        tpl: function (data: any) {
          return `<div class="element">
                    <span class="element-label">${data.id}</span>
                    <span class="element-graphic">
                      <span class="overlay"></span>
                    </span>
                    
                  </div>`;
        }
      },
      {
        query: ".nodeIcon.hover",
        halign: "center",
        valign: "center",
        halignBox: "center",
        valignBox: "center",
        tpl: function (data: any) {
          return `<div class="element">
                    <span class="element-label">${data.id}</span>
                    <span class="element-graphic hover">                      
                      <span class="overlay"></span>
                    </span>
                    
                  </div>`;
        }
      }
]
} 