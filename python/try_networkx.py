import networkx as nx
from matplotlib import pyplot as plt
import numpy as np

nxGraph = None


def draw(layout='circular', figsize=None):
    """Draw graph in a matplotlib environment

    Parameters
    ----------
    layout : str
        possible are 'circular', 'shell', 'spring'
    figsize : tuple(int)
        tuple of two integers denoting the mpl figsize

    Returns
    -------
    fig : figure
    """
    layouts = {
        'circular': nx.circular_layout,
        'shell': nx.shell_layout,
        'spring': nx.spring_layout
    }
    figsize = (10, 10) if figsize is None else figsize
    fig = plt.figure(figsize=figsize)
    ax = fig.add_subplot(1, 1, 1)
    ax.axis('off')
    ax.set_frame_on(False)
    g = nxGraph
    weights = [abs(g.edge[i][j]['weight']) * 5 for i, j in g.edges()]
    nx.draw_networkx(g, pos=layouts[layout](g), ax=ax, edge_cmap=plt.get_cmap('Reds'),
                     width=2, edge_color=weights)
    return fig

draw().show()