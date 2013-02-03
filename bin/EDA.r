setwd('/Users/Rebecca/Dropbox/COGS-Datafest/Data/CampaignFin12')

library(ggplot2)
library(reshape)
library(scales)

contributions = read.csv('contributions.fec.2012.csv') #sloooooooow
cfscores = read.csv('../CFScores/CFscore_contributors.csv')
cats = read.csv('CRP_Categories.txt', head=T, sep='\t')
PACSdata = read.csv('cleaned_pacs12.txt') #text was created by sed s/\|//g < pacs12.txt > cleaned_pacs12.txt
names(PACSdata) = c('Cycle', 'FECRecNo', 'PACID', 'CID', 'Amount', 'Date', 'RealCode', 'Type', 'DI', 'FECCandID')
#need to remove data where REALCODE == z9* and z4* =  eliminate transfers and joint fundraising committees."

pacs = contributions[contributions$committee_ext_id %in% PACSdata$PACID,]

names(cats)[1] = 'contributor_category'
pacs_full = join(pacs, cats, by='contributor_category')
pacs_full$date_conv = as.Date(pacs_full$date, format="%m/%d/%y") #could lubridate this mdy()
pacs_full = order(pacs_full, date_conv)d[order(as.Date(d$V3, format="%d/%m/%Y")),]
pacs_full = pacs_full[order(pacs_full$date_conv),]
pacs_full = pacs_full[-1:-133,]

p = ggplot(pacs_full, aes(date_conv, colour=Sector)) + geom_line(stat='bin') 