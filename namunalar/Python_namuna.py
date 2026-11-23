import numpy as np
import matplotlib.pyplot as plt
x = np.linspace(-3, 3, 400)
plt.plot(x, x**3 - 3*x)
plt.grid()
plt.show()
