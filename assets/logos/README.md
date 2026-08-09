# Employer logos

These files back the employer strip in the hero. All five are present:

```
schazoo-zaka.png          Schazoo Zaka (Pvt.) Ltd.       from schazoozaka.com
wilshire-labs.png         Wilshire Laboratories          from wilshirelabs.com
bf-biosciences.png        BF Biosciences Ltd.            from bfbio.com
ccl-pharmaceuticals.png   CCL Pharmaceuticals            from cclpharma.com
martin-dow.svg            Martin Dow                     from martindow.com.pk
```

## Replacing one

Keep the base name; **the extension does not matter.** The page requests the extension
named in `index.html` and, if that is missing, falls back through `.png`, `.svg`, `.jpg`,
`.jpeg` and `.webp` in turn. If every one 404s, the tile shows a gradient monogram
(SZ, WL, BF, CCL, MD) rather than a broken image.

## Sizing

Anything from about 240px wide upward. Each logo is drawn into a fixed 52px-tall box with
`object-fit: contain`, so tall, square and wide logos all fit without cropping.

Note the box is sized in pixels on purpose — a percentage height is ignored on a centred
CSS grid item, which let the logos overflow the plate. See the comment on `.co-logo` in
`css/style.css`.

## Why the white plate

The plate stays white in both light and dark themes. That keeps each brand's real colours
accurate and stops logos that ship with a white background from showing as pale boxes on
the dark background.

> Company logos are trademarks of their respective owners, downloaded from each company's
> own website. They are used here to illustrate employment history.
