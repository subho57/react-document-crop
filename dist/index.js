function e(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var t=require("opencv-react"),r=require("react"),n=e(r),o=e(require("react-draggable"));function i(){return(i=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}).apply(this,arguments)}var a=function(e,t,r){return{width:e,height:e,backgroundColor:t,border:r,borderRadius:"100%",position:"absolute",zIndex:1001}},c=function(e){var t=e.cropPoints,c=e.pointArea,u=e.defaultPosition,l=e.pointSize,s=e.pointBgColor,h=void 0===s?"transparent":s,d=e.pointBorder,f=void 0===d?"4px solid #3cabe2":d,p=e.onStop,v=e.onDrag,m=e.bounds,g=r.useCallback(function(e,t){v(i({},t,{x:t.x+l/2,y:t.y+l/2}),c)},[v]),y=r.useCallback(function(e,r){p(i({},r,{x:r.x+l/2,y:r.y+l/2}),c,t)},[v,t]);return n.createElement(o,{bounds:m,defaultPosition:u,position:{x:t[c].x-l/2,y:t[c].y-l/2},onDrag:g,onStop:y},n.createElement("div",{style:a(l,h,f)}))},u=["previewDims"],l=function(e){var t=e.previewDims,r=function(e,t){if(null==e)return{};var r,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)t.indexOf(r=i[n])>=0||(o[r]=e[r]);return o}(e,u);return n.createElement(n.Fragment,null,n.createElement(c,Object.assign({pointArea:"left-top",defaultPosition:{x:0,y:0}},r)),n.createElement(c,Object.assign({pointArea:"right-top",defaultPosition:{x:t.width,y:0}},r)),n.createElement(c,Object.assign({pointArea:"right-bottom",defaultPosition:{x:0,y:t.height}},r)),n.createElement(c,Object.assign({pointArea:"left-bottom",defaultPosition:{x:t.width,y:t.height}},r)))},s=function(e){var t=e.cropPoints,o=e.previewDims,i=e.lineWidth,a=void 0===i?3:i,c=e.lineColor,u=void 0===c?"#3cabe2":c,l=e.pointSize,s=r.useRef(null),h=r.useCallback(function(){var e,t=null===(e=s.current)||void 0===e?void 0:e.getContext("2d",{alpha:!0,willReadFrequently:!0});null==t||t.clearRect(0,0,o.width,o.height)},[s.current,o]),d=r.useCallback(function(){return["left-top","right-top","right-bottom","left-bottom"].reduce(function(e,r){return[].concat(e,[t[r]])},[])},[t]),f=r.useCallback(function(e){var t,r=e[0],n=e[1],o=e[2],i=e[3],c=null===(t=s.current)||void 0===t?void 0:t.getContext("2d",{alpha:!0,willReadFrequently:!0});c&&(c.lineWidth=a,c.strokeStyle=u,c.beginPath(),c.moveTo(r.x+l/2,r.y),c.lineTo(n.x-l/2,n.y),c.moveTo(n.x,n.y+l/2),c.lineTo(o.x,o.y-l/2),c.moveTo(o.x-l/2,o.y),c.lineTo(i.x+l/2,i.y),c.moveTo(i.x,i.y-l/2),c.lineTo(r.x,r.y+l/2),c.closePath(),c.stroke())},[s.current]);return r.useEffect(function(){if(t&&s.current){h();var e=d();f(e)}},[t,s.current]),n.createElement("canvas",{ref:s,style:{position:"absolute",zIndex:5},width:o.width,height:o.height})},h=function(e){return{width:e.width,height:e.height}},d=1,f=function(e){var o=e.image,a=e.onDragStop,c=e.onChange,u=e.cropperRef,f=e.pointSize,p=void 0===f?30:f,v=e.lineWidth,m=e.pointBgColor,g=e.pointBorder,y=e.lineColor,w=e.maxWidth,x=e.maxHeight,b=t.useOpenCv(),C=b.loaded,E=b.cv,R=r.useRef(),P=r.useRef(null),S=r.useRef(null),A=r.useState(),O=A[0],T=A[1],B=r.useState(),_=B[0],z=B[1],F=r.useState(!1),j=F[0],D=F[1],I=r.useState("crop"),M=I[0],k=I[1],H=function(){if(R.current){var e=function(e,t,r,n){var o=e/t,i=r||window.innerWidth,a=n||window.innerHeight,c={width:i,height:Math.round(i/o),ratio:o};return c.height>a&&(c.height=a,c.width=Math.round(a*o)),c}(R.current.width,R.current.height,w,x);T(e),P.current&&(P.current.width=e.width,P.current.height=e.height,d=e.width/R.current.width)}};r.useImperativeHandle(u,function(){return{backToCrop:function(){k("crop")},done:function(e){void 0===e&&(e={});try{return Promise.resolve(new Promise(function(t,r){D(!0),E&&R.current&&_?(function(e,t,r,n,o){var i,a,c=e.imread(t),u=r["right-bottom"],l=r["left-bottom"],s=r["right-top"],h=r["left-top"],d=[h,s,u,l].map(function(e){return[e.x/n,e.y/n]}),f=Math.max(u.x-l.x,s.x-h.x)/n,p=Math.max(l.y-h.y,u.y-s.y)/n,v=[[0,0],[f-1,0],[f-1,p-1],[0,p-1]],m=e.matFromArray(4,1,e.CV_32FC2,(i=[]).concat.apply(i,d)),g=e.matFromArray(4,1,e.CV_32FC2,(a=[]).concat.apply(a,v)),y=e.getPerspectiveTransform(m,g),w=new e.Size(f,p);e.warpPerspective(c,c,y,w,e.INTER_LINEAR,e.BORDER_CONSTANT,new e.Scalar),e.imshow(t,c),c.delete(),m.delete(),g.delete(),y.delete(),o()}(E,R.current,_,d,H),function(e,t,r){try{var n=i({blur:!1,th:!0,thMode:e.ADAPTIVE_THRESH_MEAN_C,thMeanCorrection:15,thBlockSize:25,thMax:255,grayScale:!0},r),o=e.imread(t);if(n.grayScale&&e.cvtColor(o,o,e.COLOR_RGBA2GRAY,0),n.blur){var a=new e.Size(5,5);e.GaussianBlur(o,o,a,0,0,e.BORDER_DEFAULT)}n.th&&(n.grayScale?e.adaptiveThreshold(o,o,n.thMax,n.thMode,e.THRESH_BINARY,n.thBlockSize,n.thMeanCorrection):(o.convertTo(o,-1,1,60),e.threshold(o,o,170,255,e.THRESH_BINARY))),e.imshow(t,o),Promise.resolve()}catch(e){return Promise.reject(e)}}(E,R.current,e.filterCvParams),e.preview&&k("preview"),R.current.toBlob(function(e){e?t(e):r(new Error("Failed to create blob")),D(!1)},o instanceof File?o.type:"image/png")):r(new Error("OpenCV not loaded or canvas not initialized"))}))}catch(e){return Promise.reject(e)}}}});var N=function(){if(E&&R.current&&P.current){var e=E.imread(R.current),t=new E.Mat,r=new E.Size(0,0);E.resize(e,t,r,d,d,E.INTER_AREA),E.imshow(P.current,t),e.delete(),t.delete()}};r.useEffect(function(){"preview"===M&&N()},[M]);var L=function(){if(S.current){var e=S.current.getContext("2d",{alpha:!0,willReadFrequently:!0});null==e||e.clearRect(0,0,S.current.width,S.current.height)}};r.useEffect(function(){_&&(null==c||c(i({},_,{loading:j})))},[_,j]),r.useEffect(function(){o&&P.current&&C&&"crop"===M?function(){try{return Promise.resolve((e=o,e instanceof File?new Promise(function(t,r){var n=new FileReader;n.onload=function(e){t(n.result)},n.onerror=function(e){r(e)},n.readAsDataURL(e)}):Promise.resolve("string"==typeof e?e:null))).then(function(e){if(e)return Promise.resolve(function(e){try{return Promise.resolve(new Promise(function(t){var r,n,o=document.createElement("img");o.onload=function(){try{R.current=document.createElement("canvas"),R.current.width=o.width,R.current.height=o.height;var e=R.current.getContext("2d",{alpha:!0,willReadFrequently:!0});return null==e||e.drawImage(o,0,0),H(),t(),Promise.resolve()}catch(e){return Promise.reject(e)}},r=window.location,null===(n=e.match(/^(\w+:)\/\/([^:/?#]*):?(\d*)/i))||n[1]===r.protocol&&n[2]===r.hostname&&n[3]===r.port||(o.crossOrigin="anonymous"),o.src=e}))}catch(e){return Promise.reject(e)}}(e)).then(function(){N(),function(){if(E&&R.current){var e=E.imread(R.current),t=new E.Size(5,5);E.cvtColor(e,e,E.COLOR_RGBA2GRAY,0),E.GaussianBlur(e,e,t,0,0,E.BORDER_DEFAULT),E.Canny(e,e,75,200),E.threshold(e,e,120,200,E.THRESH_BINARY);var r=new E.MatVector,n=new E.Mat;E.findContours(e,r,n,E.RETR_CCOMP,E.CHAIN_APPROX_SIMPLE);var o=E.boundingRect(e);e.delete(),n.delete(),r.delete(),Object.keys(o).forEach(function(e){o[e]*=d}),z({"left-top":{x:o.x,y:o.y},"right-top":{x:o.x+o.width,y:o.y},"right-bottom":{x:o.x+o.width,y:o.y+o.height},"left-bottom":{x:o.x,y:o.y+o.height}})}}(),D(!1)})})}catch(e){return Promise.reject(e)}var e}():D(!0)},[o,P.current,C,M]);var q=r.useCallback(function(e,t){var r,n=e.x,o=e.y,a=null===(r=S.current)||void 0===r?void 0:r.getContext("2d",{alpha:!0,willReadFrequently:!0});L(),P.current&&(null==a||a.drawImage(P.current,n-(p-10),o-(p-10),p+5,p+5,n+10,o-90,p+20,p+20),z(function(e){var r;return i({},e,((r={})[t]={x:n,y:o},r))}))},[]),W=r.useCallback(function(e,t,r){var n,o=e.x,c=e.y;L(),z(function(e){var r;return i({},e,((r={})[t]={x:o,y:c},r))}),null==a||a(i({},r,((n={})[t]={x:o,y:c},n.loading=j,n)))},[]);return n.createElement("div",{style:i({position:"relative"},O&&h(O))},O&&"crop"===M&&_&&P.current&&n.createElement(r.Fragment,null,n.createElement(l,{pointSize:p,pointBgColor:m,pointBorder:g,cropPoints:_,previewDims:O,onDrag:q,onStop:W,bounds:{left:P.current.offsetLeft-p/2,top:P.current.offsetTop-p/2,right:P.current.offsetLeft-p/2+P.current.offsetWidth,bottom:P.current.offsetTop-p/2+P.current.offsetHeight}}),n.createElement(s,{previewDims:O,cropPoints:_,lineWidth:v,lineColor:y,pointSize:p}),n.createElement("canvas",{style:{position:"absolute",zIndex:5,pointerEvents:"none"},width:O.width,height:O.height,ref:S})),n.createElement("canvas",{style:{zIndex:5,pointerEvents:"none"},ref:P}))},p=n.forwardRef(function(e,r){return e.image?n.createElement(t.OpenCvProvider,{openCvPath:e.openCvPath},n.createElement(f,Object.assign({},e,{cropperRef:r}))):null});module.exports=p;
//# sourceMappingURL=index.js.map
