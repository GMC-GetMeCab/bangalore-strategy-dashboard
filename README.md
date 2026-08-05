# Bangalore strategy dashboard

Browsable daily control board for the [Bangalore B2C Market Hub epic](https://github.com/GMC-GetMeCab/compass/issues/1).

The dashboard separates:

- weighted initiative completion;
- daily delivery movement;
- GA4 organic traffic;
- settled Search Console performance;
- Beacon funnel coverage;
- underlying GitHub and production evidence.

## Update contract

Update `data/report.json` and add a dated report under `reports/`. Never overwrite historical completion without documenting a methodology correction. Missing outcome inputs are `unavailable`, not zero.

The site deploys through GitHub Pages on every push to `main`.
