# Standard plotly imports
import plotly.plotly as py
import plotly.graph_objs as go
from plotly.offline import iplot, init_notebook_mode
# Using plotly + cufflinks in offline mode
import cufflinks

from retrieval import get_data

df = get_data(fname='stats.html')

cufflinks.go_offline(connected=True)
init_notebook_mode(connected=True)

df['claps'].iplot(kind='hist', xTitle='claps',
				  yTitle='count', title='Claps Distribution')
