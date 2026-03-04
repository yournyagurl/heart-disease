import subprocess
import sys

# libraries auto install
def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])

required = ["pandas", "numpy", "scikit-learn"]
for pkg in required:
    try:
        __import__(pkg if pkg != "scikit-learn" else "sklearn")
    except ImportError:
        print(f"Installing {pkg}...")
        install(pkg)

# imports
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# load data
df = pd.read_csv("heart.csv")
# clean data
df = df.drop_duplicates().reset_index(drop=True)
df["target"] = (df["target"] > 0).astype(int)

#features
categorical_cols = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]
continuous_cols  = ["age", "trestbps", "chol", "thalach", "oldpeak"]

ohe   = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
X_cat = ohe.fit_transform(df[categorical_cols])
X_num = df[continuous_cols].values
X     = np.hstack([X_num, X_cat])
y     = df["target"].values

#split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

def evaluate(model, label):
    y_pred = model.predict(X_test)
    print(f"\n=== {label} ===")
    print(f"Accuracy  : {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision : {precision_score(y_test, y_pred):.4f}")
    print(f"Recall    : {recall_score(y_test, y_pred):.4f}")
    print(f"F1 Score  : {f1_score(y_test, y_pred):.4f}")
    print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

# c4.5
c45 = DecisionTreeClassifier(
    criterion="entropy",
    class_weight="balanced",
    random_state=42
)
c45.fit(X_train, y_train)
evaluate(c45, "C4.5")

# cart
cart = DecisionTreeClassifier(
    criterion="gini",
    class_weight="balanced",
    random_state=42
)
cart.fit(X_train, y_train)
evaluate(cart, "CART")

# cart pruned
path   = cart.cost_complexity_pruning_path(X_train, y_train)
alphas = [a for a in path.ccp_alphas if a > 0]
skf    = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

best_alpha, best_f1 = 0.0, 0.0
for alpha in alphas[::2]:
    clf = DecisionTreeClassifier(
        criterion="gini",
        ccp_alpha=alpha,
        class_weight="balanced",
        random_state=42
    )
    scores = cross_val_score(clf, X_train, y_train, cv=skf, scoring="f1")
    if scores.mean() > best_f1:
        best_f1    = scores.mean()
        best_alpha = alpha

cart_pruned = DecisionTreeClassifier(
    criterion="gini",
    ccp_alpha=best_alpha,
    class_weight="balanced",
    random_state=42
)
cart_pruned.fit(X_train, y_train)
evaluate(cart_pruned, "CART Pruned")

feat_names = continuous_cols + ohe.get_feature_names_out(categorical_cols).tolist()
imps       = cart_pruned.feature_importances_
top_idx    = np.argsort(imps)[::-1][:10]

print(f"\n{'Feature':<30} {'Importance':>10}")
print("-" * 42)
for i in top_idx:
    if imps[i] > 0:
        print(f"{feat_names[i]:<30} {imps[i]:>10.4f}")
