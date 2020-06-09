import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: {
        name,
      },
    });
    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productArray = await this.ormRepository.find({
      where: {
        id: In(products.map(product => product.id)),
      },
    });

    return productArray;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const findProducts = await this.findAllById(
      products.map(product => ({ id: product.id })),
    );

    const productUpdatedList = findProducts.map(product => ({
      ...product,
      quantity:
        product.quantity -
        (products.find(({ id }) => id === product.id)?.quantity || 0),
    }));

    await this.ormRepository.save(productUpdatedList);

    return productUpdatedList;
  }
}

export default ProductsRepository;
