
const mongoose=require('mongoose');



const users=require('../model/users');
const products = require('../model/products');
const categories = require('../model/categories')
const Orders = require('../model/orders');



module.exports={

    addproduct:(productdetails,image)=>{
        console.log(productdetails,'{{{');
        return new Promise(async (resolve,reject)=>{
            const product=new products({
                title:productdetails.title,
                description:productdetails.description,
                cost:productdetails.cost,
                mycategory:productdetails.mycategory,
                image:image
            })
         await product.save();
         resolve();            
        })
    },
    deleteProduct:(Id)=>{
        return new Promise((resolve,reject)=>{
          products.deleteOne({_id:Id}).then(result=>{
          resolve()
      
      
            
          }).catch(error=>{
            reject(error);
          })
        })
      },

      getProductById:(id)=>{
        return products.findById(id).exec();
      },

      update:(id,details)=>{
        return new Promise((resolve,reject)=>{
            products.updateOne({_id:id},{
                $set:{
                    title:details.title,
                    description:details.description,
                    cost:details.cost,
                    mycategory:details.mycategory,
                },
            }) 
            .then(()=>{
                resolve();
            })
            .catch((err)=>{
                reject(err);
            })
        })
      },
      addcategory:(categorydetails,images)=>{
        console.log(categorydetails);
        return new Promise( async (resolve,reject)=>{
          const title =await categories.findOne({title:categorydetails.category})
          if(title){
            reject({error:`This category ${categorydetails.category} exists.` })
          }else{
const category=new categories({
                title:categorydetails.category,
                description:categorydetails.description,
                image :images
            })
            await category.save();
            resolve();
          }
            
        })
    },
    displayCategory:()=>{
      return new Promise((resolve,reject)=>{
        categories.find().then(response=>{
          resolve(response)
        }).catch(err=>{
          reject(err)
        })
      })

    },
    deleteCategory:(id)=>{
      return new Promise((resolve,reject)=>{
      categories.deleteOne({_id:id}).then(response=>{
        resolve(response)
      }).catch(err=>{
        reject(err)
      })
    })

  },
  findEditCategory:(id)=>{
    return new Promise((resolve,reject)=>{
      categories.findById(id).then(response=>{
        resolve(response)
      }).catch(err=>{
        reject(err)
      })
    })

  },

  updateCategory:(details,id)=>{
    return new Promise((resolve,reject)=>{
      console.log()
      categories.updateOne({_id:id},{
        $set:{
          title:details.category,
          description:details.description,
        }
      })
      .then(()=>{
        resolve();
      })
      .catch((err)=>{
        reject(err);
      })
    })
  },

  displayHomeProduct:()=>{ 
    return new Promise(async (resolve,reject)=>{
     let items=await products.find({})
     if(items){
       resolve(items)
     }else{
       reject()
     }
     
    });
  },
  paginate:(pageSize,currentPage)=>{
    const limitValue=2
    return new Promise((resolve,reject)=>{
      products.find()
      .skip((limitValue*currentPage)-limitValue)
      .limit(limitValue).then(response=>{
        console.log(response);
        resolve(response)
      }).catch(err=>{
        reject(err)
      })
    })
  },

}



        
    

