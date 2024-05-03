import pandas as pd
import numpy as np

data = pd.read_csv("Dataset.csv")

# augmenting data 
 
from sklearn.utils import shuffle 
 
# Augment the dataset by shuffling the existing data 
augmented_data = pd.concat([data, shuffle(data)], axis=0) 
 
# Repeat the shuffling process to further increase the dataset size 
augmented_data = pd.concat([augmented_data, shuffle(augmented_data)], axis=0) 
 
# Reset the index of the augmented data 
augmented_data = augmented_data.reset_index(drop=True) 
 
# Verify the size of the augmented dataset 
print("Augmented dataset size:", len(augmented_data)) 
 
data_dum = augmented_data

# map the results
category = {"A+": 8, "A": 7, "A-": 6, "B+": 5, "B": 4, "B-": 3, "C+": 2, "C": 1, "R": 0}
data_dum["Measurements"] = data_dum["Measurements"].map(category)
data_dum["Maths"] = data_dum["Maths"].map(category)
data_dum["Mechanics"] = data_dum["Mechanics"].map(category)
data_dum["POM"] = data_dum["POM"].map(category)
data_dum["Electricity"] = data_dum["Electricity"].map(category)
data_dum["Thermodynamics"] = data_dum["Thermodynamics"].map(category)
data_dum["Computer"] = data_dum["Computer"].map(category)
data_dum["Maths2"] = data_dum["Maths2"].map(category)
data_dum["Programming"] = data_dum["Programming"].map(category)
data_dum["Fluid"] = data_dum["Fluid"].map(category)
data_dum["Electronics"] = data_dum["Electronics"].map(category)
data_dum["Manufacturing"] = data_dum["Manufacturing"].map(category)
data_dum["Drawing"] = data_dum["Drawing"].map(category)

# map the Department
category = {"CE": 0, "ME": 1, "EE": 2, "CO": 3}
data_dum["Department"] = data_dum["Department"].map(category)

from sklearn.model_selection import train_test_split

x = data_dum.drop("Department", axis=1)
y = data_dum["Department"]

""" ## MI scores

from sklearn.feature_selection import mutual_info_classif

# Calculate MI scores
mi_scores = mutual_info_classif(x, y, random_state=0)

# Get feature names
feature_names = data_dum.columns

# Print MI scores for each feature
for feature, score in zip(feature_names, mi_scores):
    print(f"{feature}: {score}")

# PCA
from sklearn.decomposition import PCA
from sklearn.feature_selection import mutual_info_classif

# Perform PCA to reduce dimensionality
pca = PCA()
X_pca = pca.fit_transform(x)

# Calculate MI scores for PCA components
mi_scores = mutual_info_classif(X_pca, y, random_state=42)

# Print MI scores for each feature
for i, score in enumerate(mi_scores):
    print(f"Feature {i}: {score}")

# Find the index of the feature with the max MI score
max_mi_index = mi_scores.argmax()

# Get the feature values with the max MI score
max_mi_feature = X_pca[:, max_mi_index]

# Add the feature as a new column in the original dataframe
data_dum["Max_MI_Feature"] = max_mi_feature

x = data_dum.drop("Department", axis=1)
y = data_dum["Department"]  """

# GVM

from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    x, y, test_size=0.20, random_state=42
)

gbm = GradientBoostingClassifier(
    random_state=0, n_estimators=109, max_depth=7, learning_rate=0.08
)
gbm.fit(X_train, y_train)
y_pred_gbm = gbm.predict(X_test)
accuracy_gbm = accuracy_score(y_test, y_pred_gbm)

# print

print(f"GBM Accuracy: {accuracy_gbm}")

import pickle

pickle.dump(gbm, open("model.pkl", "wb"))

model = pickle.load(open("model.pkl", "rb"))
print(
    model.predict([["8", "8", "8", "8", "8", "8", "8", "8", "8", "8", "8", "8", "8"]])
)
