from typing import Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/categories", tags=["Categories"])

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

_categories: Dict[str, CategoryResponse] = {}

@router.get("/", response_model=List[CategoryResponse])
def get_categories() -> List[CategoryResponse]:
    """Return list of all categories."""
    return list(_categories.values())

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: str) -> CategoryResponse:
    """Return a category by its id."""
    category = _categories.get(category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=CategoryResponse, status_code=201)
def create_category(category: CategoryCreate) -> CategoryResponse:
    """Create a new category."""
    category_id = str(uuid4())
    new_category = CategoryResponse(id=category_id, **category.dict())
    _categories[category_id] = new_category
    return new_category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: str, category_update: CategoryUpdate) -> CategoryResponse:
    """Update an existing category."""
    existing = _categories.get(category_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Category not found")

    updated_data = existing.dict()
    update_fields = category_update.dict(exclude_unset=True)
    updated_data.update(update_fields)

    updated_category = CategoryResponse(**updated_data)
    _categories[category_id] = updated_category
    return updated_category

@router.delete("/{category_id}")
def delete_category(category_id: str) -> Dict[str, str]:
    """Delete a category by id."""
    if category_id not in _categories:
        raise HTTPException(status_code=404, detail="Category not found")
    del _categories[category_id]
    return {"message": "Category deleted successfully."}
