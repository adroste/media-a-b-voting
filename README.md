# media a/b voting app

This app allows A/B voting for media (images and videos) inside local directories.
It can be used for fast media culling.

* The votes are written to the `__voting_db.json` file inside the selected folder.
* The app uses an elo-based ranking algorithm, that will output the rankings into the same file.
* It also has a "star" feature to allow boosting the elo of selected file.
* The app only supports **Chrome** based browsers.

## on github

Link: [https://adroste.github.io/media-a-b-voting/dist/](https://adroste.github.io/media-a-b-voting/dist/)

The app will work on local files only. Nothing is uploaded or processed remotely. 

## run locally

1. run `npm i` 
2. run `npm run build`
3. run `npm run preview`
4. visit the shown url

## local development

run `npm run dev`

## rating algorithms

The app requires a ranking model that can be used to evaluate and rank entities based on pairwise interactions or match outcomes.

This source code has implementations for two ranking models:

1. Davidson Model (extended Bradley-Terry Model):
  - A probabilistic model used for pairwise comparisons.
  - Extends the Bradley-Terry model by incorporating additional parameters to account for ties or other complexities in the data.

2. Elo Model:
  - A rating system originally designed for chess but widely used in other competitive settings.
  - Updates player ratings based on the outcome of matches, with adjustments depending on the expected probability of winning.

Findings:

* The Bradley-Terry model (without ties) performs really well. However, the Davidson model is required to add 'tie' votes.
* The Davidson model does not perform as well with sparse data and requires more input data to converge.
* The elo model when trained with shuffled iterations, performs better on less data
