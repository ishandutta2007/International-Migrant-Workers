import matplotlib.pyplot as plt

# Complete single dataset to avoid empty line/index gaps
years = [2013, 2017, 2019, 2022, 2026, 2030, 2040, 2050]
workers = [150.4, 164.0, 169.0, 167.7, 171.5, 185.0, 210.0, 245.0]

plt.figure(figsize=(12, 7))

# Step 1: Draw the lines piece-by-piece to create a perfect transition
for i in range(len(years) - 1):
    x_seg = [years[i], years[i+1]]
    y_seg = [workers[i], workers[i+1]]
    
    # 2022 is the pivot point. Anything before or touching 2022 is Historical (Solid)
    if years[i+1] <= 2022:
        plt.plot(x_seg, y_seg, linestyle='-', color='#1f77b4', linewidth=2.5)
    else:
        plt.plot(x_seg, y_seg, linestyle='--', color='#ff7f0e', linewidth=2.5)

# Step 2: Overlay standalone markers for visual clarity
# Historical markers (circular)
plt.scatter(years[:4], workers[:4], color='#1f77b4', marker='o', s=60, zorder=3, label='Historical Data (ILO)')
# Current & Projected markers (square)
plt.scatter(years[4:], workers[4:], color='#ff7f0e', marker='s', s=60, zorder=3, label='Current & Projected Trends (UN/ILO)')

# Step 3: Annotate ALL data points without exception
for x, y in zip(years, workers):
    # Dynamic offset to keep text clean and avoid line collisions
    offset = (10, -5) if x in [2019, 2026] else (10, 5) 
    
    plt.annotate(
        f'{y}M', 
        xy=(x, y), 
        xytext=offset, 
        textcoords='offset points', 
        fontsize=10, 
        fontweight='bold',
        bbox=dict(boxstyle='round,pad=0.2', fc='yellow', alpha=0.3, ec='gray', lw=0.5)
    )

# Formatting and Aesthetic Layout
plt.title('Global International Migrant Workers: Historical & Projections (2013–2050)', fontsize=14, fontweight='bold', pad=15)
plt.xlabel('Year', fontsize=12, labelpad=10)
plt.ylabel('Estimated Migrant Workers (in Millions)', fontsize=12, labelpad=10)

plt.xticks(years)
plt.grid(True, linestyle=':', alpha=0.6)

# Background shading for the post-2030 accelerated necessity-driven migration era
plt.axvspan(2030, 2050, color='gray', alpha=0.07, label='Accelerated Necessity-Driven Era')

# Rebuild the legend handling manually to keep it perfectly clean
plt.legend(loc='upper left', fontsize=11)
import os
os.makedirs('assets', exist_ok=True)
output_path = os.path.join('assets', 'migrant_workers_plot.png')
plt.savefig(output_path, dpi=300, bbox_inches='tight')
print(f"Plot saved successfully to {output_path}")

# Display the chart
plt.show()
