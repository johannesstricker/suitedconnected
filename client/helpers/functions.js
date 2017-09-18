/** Used for fitting the profile and group info editing form. */
fitToContent = function(id, maxHeight)
{
   var text = id && id.style ? id : document.getElementById(id);
   if (!text)
      return;

   /* Accounts for rows being deleted, pixel value may need adjusting */
   if (text.clientHeight == text.scrollHeight) {
      text.style.height = "30px";
   }

   var adjustedHeight = text.clientHeight;
   if (!maxHeight || maxHeight > adjustedHeight)
   {
      adjustedHeight = Math.max(text.scrollHeight, adjustedHeight);
      adjustedHeight += 5;
      if (maxHeight)
         adjustedHeight = Math.min(maxHeight, adjustedHeight);
      if (adjustedHeight > text.clientHeight)
         text.style.height = adjustedHeight + "px";
   }
}
