/* ==========================================================================
   AGANCEONLINE — Showroom Gallery Data
   ==========================================================================
   HOW TO ADD YOUR OWN SHOWROOM PHOTOS:

   1. Drop your image files into the  /images/gallery/  folder
      (e.g. images/gallery/showroom-01.jpg)

   2. Add or edit an entry below. Each entry only needs:
        src   -> path to the image (local file or any image URL)
        alt   -> short description (used for accessibility)
        size  -> "wide" | "tall" | "normal"  (controls grid shape, optional)

   3. Save the file. No other code changes are needed — the gallery grid
      and lightbox are both generated automatically from this list.

   Until real photos are added, the entries below point to temporary
   placeholder imagery so the gallery is fully functional out of the box.
   Simply replace the "src" values with your own local files whenever ready.
   ========================================================================== */

const GALLERY_ITEMS = [
  {
    type: "video",
    src: "images/showroom/Video.mp4",
    alt: "Showroom Video",
    size: "tall"
  }
];
